import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "../test-utils"
import { IngredientsTable } from "@/components/ingredients-table"
import { AddIngredientForm } from "@/components/add-ingredient-form"
import * as api from "@/lib/api"

jest.mock("@/lib/api")
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

const mockFetchIngredients = api.fetchIngredients as jest.MockedFunction<
  typeof api.fetchIngredients
>
const mockFetchRecipes = api.fetchRecipes as jest.MockedFunction<
  typeof api.fetchRecipes
>
const mockCreateIngredient = api.createIngredient as jest.MockedFunction<
  typeof api.createIngredient
>
const mockDeleteIngredient = api.deleteIngredient as jest.MockedFunction<
  typeof api.deleteIngredient
>

const mockIngredients = [
  { id: "ing1", name: "Flour", unit: "grams", category: "Baking" },
  { id: "ing2", name: "Sugar", unit: "grams", category: "Baking" },
  { id: "ing3", name: "Eggs", unit: "pieces", category: "Dairy" },
]

const mockRecipes = [
  {
    id: "r1",
    name: "Pancakes",
    ingredients: [
      { ingredientId: "ing1", quantity: 200, name: "Flour", unit: "grams" },
    ],
  },
]

const defaultTableProps = {
  selectedIds: new Set<string>(),
  onToggle: jest.fn(),
  onSelectAll: jest.fn(),
  onDeselectAll: jest.fn(),
}

beforeEach(() => {
  jest.clearAllMocks()
  mockFetchIngredients.mockResolvedValue([...mockIngredients])
  mockFetchRecipes.mockResolvedValue([...mockRecipes])
})

describe("IngredientsTable", () => {
  it("renders a loading state initially", () => {
    mockFetchIngredients.mockReturnValue(new Promise(() => {})) // never resolves
    const { container } = renderWithProviders(
      <IngredientsTable {...defaultTableProps} />
    )
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument()
  })

  it("renders all ingredients in the table", async () => {
    renderWithProviders(<IngredientsTable {...defaultTableProps} />)

    await waitFor(() => {
      expect(screen.getByText("Flour")).toBeInTheDocument()
    })

    expect(screen.getByText("Sugar")).toBeInTheDocument()
    expect(screen.getByText("Eggs")).toBeInTheDocument()
  })

  it("renders column headers", async () => {
    renderWithProviders(<IngredientsTable {...defaultTableProps} />)

    await waitFor(() => {
      expect(screen.getByText("Name")).toBeInTheDocument()
    })

    expect(screen.getByText("Unit")).toBeInTheDocument()
    expect(screen.getByText("Category")).toBeInTheDocument()
  })

  it("shows empty state when there are no ingredients", async () => {
    mockFetchIngredients.mockResolvedValue([])
    renderWithProviders(<IngredientsTable {...defaultTableProps} />)

    await waitFor(() => {
      expect(screen.getByText(/no ingredients yet/i)).toBeInTheDocument()
    })
  })

  it("calls deleteIngredient after confirming the delete dialog", async () => {
    mockDeleteIngredient.mockResolvedValue(undefined)
    const user = userEvent.setup()

    renderWithProviders(<IngredientsTable {...defaultTableProps} />)

    await waitFor(() => {
      expect(screen.getByText("Sugar")).toBeInTheDocument()
    })

    const deleteButton = screen.getByLabelText("Delete Sugar")
    await user.click(deleteButton)

    // Dialog should appear
    expect(
      screen.getByText(/are you sure you want to delete/i)
    ).toBeInTheDocument()

    // Confirm deletion
    const confirmButton = screen.getByRole("button", { name: /delete/i })
    await user.click(confirmButton)

    expect(mockDeleteIngredient).toHaveBeenCalled()
    expect(mockDeleteIngredient.mock.calls[0][0]).toBe("ing2")
  })

  it("does not delete when the cancel button is clicked in the dialog", async () => {
    const user = userEvent.setup()

    renderWithProviders(<IngredientsTable {...defaultTableProps} />)

    await waitFor(() => {
      expect(screen.getByText("Sugar")).toBeInTheDocument()
    })

    const deleteButton = screen.getByLabelText("Delete Sugar")
    await user.click(deleteButton)

    // Dialog should appear
    expect(
      screen.getByText(/are you sure you want to delete/i)
    ).toBeInTheDocument()

    // Cancel deletion
    const cancelButton = screen.getByRole("button", { name: /cancel/i })
    await user.click(cancelButton)

    expect(mockDeleteIngredient).not.toHaveBeenCalled()
  })

  it("disables delete button for ingredients used in recipes", async () => {
    renderWithProviders(<IngredientsTable {...defaultTableProps} />)

    await waitFor(() => {
      expect(screen.getByText("Flour")).toBeInTheDocument()
    })

    // Flour is used in Pancakes recipe — delete button should be disabled
    const deleteButton = screen.getByLabelText(
      "Cannot delete Flour — used in a recipe"
    )
    expect(deleteButton).toBeDisabled()

    // Sugar is NOT used — delete button should be enabled
    const sugarDeleteButton = screen.getByLabelText("Delete Sugar")
    expect(sugarDeleteButton).not.toBeDisabled()
  })

  it("filters ingredients when typing in the search input", async () => {
    const user = userEvent.setup()

    renderWithProviders(<IngredientsTable {...defaultTableProps} />)

    await waitFor(() => {
      expect(screen.getByText("Flour")).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(
      "Search by name, unit or category…"
    )
    await user.type(searchInput, "Egg")

    expect(screen.getByText("Eggs")).toBeInTheDocument()
    expect(screen.queryByText("Flour")).not.toBeInTheDocument()
    expect(screen.queryByText("Sugar")).not.toBeInTheDocument()
  })

  it("shows all ingredients when search is cleared", async () => {
    const user = userEvent.setup()

    renderWithProviders(<IngredientsTable {...defaultTableProps} />)

    await waitFor(() => {
      expect(screen.getByText("Flour")).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(
      "Search by name, unit or category…"
    )
    await user.type(searchInput, "Egg")

    expect(screen.queryByText("Flour")).not.toBeInTheDocument()

    await user.clear(searchInput)

    expect(screen.getByText("Flour")).toBeInTheDocument()
    expect(screen.getByText("Sugar")).toBeInTheDocument()
    expect(screen.getByText("Eggs")).toBeInTheDocument()
  })
})

describe("AddIngredientForm", () => {
  it("renders form fields and submit button", () => {
    renderWithProviders(<AddIngredientForm />)

    expect(screen.getByLabelText("Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Unit")).toBeInTheDocument()
    expect(screen.getByLabelText("Category")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument()
  })

  it("submits the form with the correct data", async () => {
    mockCreateIngredient.mockResolvedValue({
      id: "new-id",
      name: "Salt",
      unit: "teaspoons",
      category: "Seasoning",
    })

    const user = userEvent.setup()
    renderWithProviders(<AddIngredientForm />)

    await user.type(screen.getByLabelText("Name"), "Salt")
    await user.type(screen.getByLabelText("Unit"), "teaspoons")
    await user.type(screen.getByLabelText("Category"), "Seasoning")
    await user.click(screen.getByRole("button", { name: /add/i }))

    await waitFor(() => {
      expect(mockCreateIngredient).toHaveBeenCalled()
    })

    expect(mockCreateIngredient.mock.calls[0][0]).toEqual({
      name: "Salt",
      unit: "teaspoons",
      category: "Seasoning",
    })
  })

  it("clears the form after successful submission", async () => {
    mockCreateIngredient.mockResolvedValue({
      id: "new-id",
      name: "Salt",
      unit: "teaspoons",
      category: "Seasoning",
    })

    const user = userEvent.setup()
    renderWithProviders(<AddIngredientForm />)

    await user.type(screen.getByLabelText("Name"), "Salt")
    await user.type(screen.getByLabelText("Unit"), "teaspoons")
    await user.type(screen.getByLabelText("Category"), "Seasoning")
    await user.click(screen.getByRole("button", { name: /add/i }))

    await waitFor(() => {
      expect(screen.getByLabelText("Name")).toHaveValue("")
    })

    expect(screen.getByLabelText("Unit")).toHaveValue("")
    expect(screen.getByLabelText("Category")).toHaveValue("")
  })
})
