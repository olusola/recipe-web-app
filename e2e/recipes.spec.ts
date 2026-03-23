import { expect, test } from "@playwright/test"
import { resetDb } from "./helpers/reset-db"

test.beforeEach(() => {
  resetDb()
})

test("redirects home to /recipes", async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveURL("/recipes")
})

test("shows seeded recipes in the list", async ({ page }) => {
  await page.goto("/recipes")
  await expect(page.getByText("Pancakes").first()).toBeVisible()
  await expect(page.getByText("Scrambled Eggs").first()).toBeVisible()
  await expect(page.getByText("Tomato Salad").first()).toBeVisible()
})

test("filters recipes by search term", async ({ page }) => {
  await page.goto("/recipes")
  await page.getByPlaceholder(/search/i).fill("Pancakes")
  await expect(page.getByText("Pancakes")).toBeVisible()
  await expect(page.getByText("Scrambled Eggs")).not.toBeVisible()
})

test("creates a new recipe", async ({ page }) => {
  await page.goto("/recipes/new")

  await page.locator("#recipe-name").fill("E2E Test Recipe")
  await page.getByPlaceholder(/describe how to prepare/i).fill("Mix and cook.")

  // Select first ingredient from the select trigger
  await page.locator("#ingredient-select").click()
  await page.getByRole("option", { name: "Flour" }).click()
  await page.locator("#ingredient-quantity").fill("100")
  await page.getByRole("button", { name: /add ingredient/i }).click()

  await page.getByRole("button", { name: /save recipe/i }).click()

  // Should redirect back to /recipes and show the new recipe
  await expect(page).toHaveURL("/recipes")
  await expect(page.getByText("E2E Test Recipe").first()).toBeVisible()
})

test("shows validation error when submitting empty recipe form", async ({
  page,
}) => {
  await page.goto("/recipes/new")
  await page.getByRole("button", { name: /save recipe/i }).click()
  await expect(
    page.getByText(/recipe name is required|at least one ingredient/i).first()
  ).toBeVisible()
})

test("navigates to recipe detail and shows ingredients", async ({ page }) => {
  await page.goto("/recipes")
  await page.getByText("Pancakes").click()
  await expect(page).toHaveURL(/\/recipes\/.+/)
  await expect(page.getByText("Flour")).toBeVisible()
  await expect(page.getByText("Eggs").first()).toBeVisible()
})

test("shows recommended recipes on detail page", async ({ page }) => {
  await page.goto("/recipes")
  await page.getByText("Pancakes").click()
  // Scrambled Eggs shares Eggs & Butter with Pancakes
  await expect(page.getByText("Scrambled Eggs")).toBeVisible()
})

test("edits a recipe name via the drawer", async ({ page }) => {
  await page.goto("/recipes")
  await page
    .getByLabel(/edit pancakes/i)
    .last()
    .click()

  const nameInput = page.locator("#edit-recipe-name")
  await nameInput.clear()
  await nameInput.fill("Updated Pancakes")

  await page.getByRole("button", { name: /save changes/i }).click()
  await page.getByText("Recipe updated").waitFor()
  await expect(page.getByText("Updated Pancakes").first()).toBeVisible()
})

test("deletes a recipe", async ({ page }) => {
  await page.goto("/recipes")
  // Recipe delete has no confirmation modal — click deletes directly
  await page
    .getByLabel(/delete pancakes/i)
    .last()
    .click()
  await expect(page.getByText("Pancakes")).not.toBeVisible()
})

test("edit button opens the drawer for a recipe", async ({ page }) => {
  await page.goto("/recipes")
  await page
    .getByLabel(/edit scrambled eggs/i)
    .last()
    .click()
  // Drawer should open with the recipe name pre-filled
  await expect(page.locator("#edit-recipe-name")).toHaveValue("Scrambled Eggs")
})
