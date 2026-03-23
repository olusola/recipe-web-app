import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "../test-utils"
import { NewRecipeForm } from "@/components/new-recipe-form"
import * as api from "@/lib/api"

const mockPush = jest.fn()
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock("@/lib/api")
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

const mockFetchIngredients = api.fetchIngredients as jest.MockedFunction<
  typeof api.fetchIngredients
>
const mockCreateRecipe = api.createRecipe as jest.MockedFunction<
  typeof api.createRecipe
>

const mockIngredients = [
  { id: "ing1", name: "Flour", unit: "grams", category: "Baking" },
  { id: "ing2", name: "Sugar", unit: "grams", category: "Baking" },
  { id: "ing3", name: "Eggs", unit: "pieces", category: "Dairy" },
]

beforeEach(() => {
  jest.clearAllMocks()
  mockFetchIngredients.mockResolvedValue([...mockIngredients])
})

describe("NewRecipeForm", () => {
  it("renders the form fields", async () => {
    renderWithProviders(<NewRecipeForm />)

    expect(screen.getByLabelText("Recipe Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Quantity")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /add ingredient/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /save recipe/i })
    ).toBeInTheDocument()
  })

  it("shows validation error when submitting without a name", async () => {
    const user = userEvent.setup()
    renderWithProviders(<NewRecipeForm />)

    await user.click(screen.getByRole("button", { name: /save recipe/i }))

    expect(screen.getByText("Recipe name is required")).toBeInTheDocument()
    expect(mockCreateRecipe).not.toHaveBeenCalled()
  })

  it("shows validation error when submitting without ingredients", async () => {
    const user = userEvent.setup()
    renderWithProviders(<NewRecipeForm />)

    await user.type(screen.getByLabelText("Recipe Name"), "Pancakes")
    await user.click(screen.getByRole("button", { name: /save recipe/i }))

    expect(
      screen.getByText("At least one ingredient is required")
    ).toBeInTheDocument()
    expect(mockCreateRecipe).not.toHaveBeenCalled()
  })

  it("adds an ingredient row when selecting ingredient and quantity", async () => {
    const user = userEvent.setup()
    renderWithProviders(<NewRecipeForm />)

    // Wait for ingredients to load
    await waitFor(() => {
      expect(mockFetchIngredients).toHaveBeenCalled()
    })

    // Open the select dropdown
    const selectTrigger = screen.getByRole("combobox")
    await user.click(selectTrigger)

    // Pick "Flour"
    const option = await screen.findByRole("option", { name: "Flour" })
    await user.click(option)

    // Enter quantity
    await user.type(screen.getByLabelText("Quantity"), "200")

    // Click add ingredient
    await user.click(screen.getByRole("button", { name: /add ingredient/i }))

    // Verify the row appears in the mini-table
    expect(screen.getByText("Flour")).toBeInTheDocument()
    expect(screen.getByText("200 grams")).toBeInTheDocument()
  })

  it("removes an ingredient row when remove button is clicked", async () => {
    const user = userEvent.setup()
    renderWithProviders(<NewRecipeForm />)

    await waitFor(() => {
      expect(mockFetchIngredients).toHaveBeenCalled()
    })

    // Add an ingredient
    const selectTrigger = screen.getByRole("combobox")
    await user.click(selectTrigger)
    const option = await screen.findByRole("option", { name: "Flour" })
    await user.click(option)
    await user.type(screen.getByLabelText("Quantity"), "200")
    await user.click(screen.getByRole("button", { name: /add ingredient/i }))

    // Verify it's added — check for the remove button
    expect(screen.getByLabelText("Remove Flour")).toBeInTheDocument()

    // Remove it
    await user.click(screen.getByLabelText("Remove Flour"))

    // The remove button should be gone (ingredient no longer in the recipe rows)
    expect(screen.queryByLabelText("Remove Flour")).not.toBeInTheDocument()
  })

  it("submits the correct payload and navigates on success", async () => {
    mockCreateRecipe.mockResolvedValue({
      id: "new-recipe",
      name: "Pancakes",
      ingredients: [{ ingredientId: "ing1", quantity: 200 }],
    })

    const user = userEvent.setup()
    renderWithProviders(<NewRecipeForm />)

    await waitFor(() => {
      expect(mockFetchIngredients).toHaveBeenCalled()
    })

    // Fill recipe name
    await user.type(screen.getByLabelText("Recipe Name"), "Pancakes")

    // Add an ingredient
    const selectTrigger = screen.getByRole("combobox")
    await user.click(selectTrigger)
    const option = await screen.findByRole("option", { name: "Flour" })
    await user.click(option)
    await user.type(screen.getByLabelText("Quantity"), "200")
    await user.click(screen.getByRole("button", { name: /add ingredient/i }))

    // Submit and wait for navigation (covers full mutation lifecycle)
    await user.click(screen.getByRole("button", { name: /save recipe/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/recipes")
    })

    expect(mockCreateRecipe.mock.calls[0][0]).toEqual({
      name: "Pancakes",
      ingredients: [{ ingredientId: "ing1", quantity: 200 }],
    })
  })

  it("shows error toast when submission fails", async () => {
    const { toast } = jest.requireMock("sonner")
    mockCreateRecipe.mockRejectedValue(new Error("Failed to create recipe"))

    const user = userEvent.setup()
    renderWithProviders(<NewRecipeForm />)

    await waitFor(() => {
      expect(mockFetchIngredients).toHaveBeenCalled()
    })

    // Fill recipe name
    await user.type(screen.getByLabelText("Recipe Name"), "Pancakes")

    // Add an ingredient
    const selectTrigger = screen.getByRole("combobox")
    await user.click(selectTrigger)
    const option = await screen.findByRole("option", { name: "Flour" })
    await user.click(option)
    await user.type(screen.getByLabelText("Quantity"), "200")
    await user.click(screen.getByRole("button", { name: /add ingredient/i }))

    // Submit and wait for error handling (covers full mutation lifecycle)
    await user.click(screen.getByRole("button", { name: /save recipe/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to create recipe")
    })

    expect(mockPush).not.toHaveBeenCalled()
  })

  it("disables Add Ingredient button when no ingredient or quantity selected", async () => {
    renderWithProviders(<NewRecipeForm />)

    const addButton = screen.getByRole("button", { name: /add ingredient/i })
    expect(addButton).toBeDisabled()
  })
})
