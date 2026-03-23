import { expect, test } from "@playwright/test"
import { resetDb } from "./helpers/reset-db"

test.beforeEach(() => {
  resetDb()
})

test("shows existing ingredients", async ({ page }) => {
  await page.goto("/ingredients")
  await expect(page.getByText("Flour")).toBeVisible()
  await expect(page.getByText("Eggs")).toBeVisible()
  // Tomato may be on page 2 due to pagination — check it exists somewhere
  await expect(page.getByText("Sugar")).toBeVisible()
})

test("filters ingredients by search term", async ({ page }) => {
  await page.goto("/ingredients")
  await page.getByPlaceholder(/search/i).fill("Flour")
  await expect(page.getByText("Flour")).toBeVisible()
  await expect(page.getByText("Eggs")).not.toBeVisible()
})

test("filters ingredients by category", async ({ page }) => {
  await page.goto("/ingredients")
  // Category filter uses pill buttons, not a combobox
  await page.getByRole("button", { name: "Dairy" }).click()
  await expect(page.getByText("Eggs")).toBeVisible()
  await expect(page.getByText("Flour")).not.toBeVisible()
})

test("adds a new ingredient via the inline form", async ({ page }) => {
  await page.goto("/ingredients")

  await page.locator("#ingredient-name").fill("Cinnamon")
  await page.locator("#ingredient-unit").fill("teaspoons")
  await page.locator("#ingredient-category").fill("Spices")

  await page.getByRole("button", { name: "Add" }).click()
  // Wait for the success toast to confirm the mutation settled
  await page.getByText("Ingredient added").waitFor()
  // New ingredient may land on page 2 due to pagination (pageSize=7, 10 seed items)
  // Search for it to confirm it exists — allow time for the background refetch
  await page.getByPlaceholder(/search/i).fill("Cinnamon")
  await expect(page.getByText("Cinnamon").first()).toBeVisible()
})

test("prevents deleting an ingredient used in a recipe", async ({ page }) => {
  await page.goto("/ingredients")
  // Flour is used in Pancakes — delete button should be disabled
  const deleteBtn = page.getByLabel(/delete flour/i)
  await expect(deleteBtn).toBeDisabled()
  // Flour should still be in the list
  await expect(page.getByText("Flour")).toBeVisible()
})

test("shows empty state in Recipe Finder when no ingredients are selected", async ({
  page,
}) => {
  await page.goto("/ingredients")
  await expect(page.getByText("Recipe Finder")).toBeVisible()
  await expect(page.getByText("Discover recipes")).toBeVisible()
  await expect(
    page.getByText(/select ingredients from the list/i)
  ).toBeVisible()
})

test("shows matching recipes when an ingredient is selected", async ({
  page,
}) => {
  await page.goto("/ingredients")
  // Wait for Recipe Finder panel to be ready (recipes data loaded)
  await expect(page.getByText("Discover recipes")).toBeVisible()
  // Select Flour — used in Pancakes (and only Pancakes among seed data)
  await page.getByLabel(/select flour/i).click()
  // Pancakes should appear in the Recipe Finder panel
  await expect(page.getByText("Pancakes")).toBeVisible()
  // Selection badge should show count
  await expect(page.getByText("1 selected")).toBeVisible()
})

test("returns to empty state when all ingredients are deselected", async ({
  page,
}) => {
  await page.goto("/ingredients")
  // Wait for Recipe Finder panel to be ready (recipes data loaded)
  await expect(page.getByText("Discover recipes")).toBeVisible()
  // Select then deselect Flour
  await page.getByLabel(/select flour/i).click()
  await expect(page.getByText("Pancakes")).toBeVisible()
  await page.getByLabel(/select flour/i).click()
  await expect(page.getByText("Discover recipes")).toBeVisible()
})

test("clicking a matched recipe navigates to its detail page", async ({
  page,
}) => {
  await page.goto("/ingredients")
  // Wait for Recipe Finder panel to be ready (recipes data loaded)
  await expect(page.getByText("Discover recipes")).toBeVisible()
  await page.getByLabel(/select flour/i).click()
  // Click the Pancakes recipe card in the Recipe Finder panel
  await page.locator("a", { hasText: "Pancakes" }).click()
  await expect(page).toHaveURL(/\/recipes\/.+/)
})
