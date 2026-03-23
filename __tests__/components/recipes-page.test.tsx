import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders } from "../test-utils"
import { RecipesTable } from "@/components/recipes-table"
import * as api from "@/lib/api"
import type { RecipeWithIngredientsType } from "@/lib/types"

jest.mock("@/lib/api")
jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

const mockPush = jest.fn()
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockFetchRecipes = api.fetchRecipes as jest.MockedFunction<
  typeof api.fetchRecipes
>
const mockDeleteRecipe = api.deleteRecipe as jest.MockedFunction<
  typeof api.deleteRecipe
>

const mockRecipes: RecipeWithIngredientsType[] = [
  {
    id: "r1",
    name: "Pancakes",
    ingredients: [
      { ingredientId: "ing1", quantity: 200, name: "Flour", unit: "grams" },
      { ingredientId: "ing2", quantity: 50, name: "Sugar", unit: "grams" },
      { ingredientId: "ing3", quantity: 2, name: "Eggs", unit: "pieces" },
    ],
  },
  {
    id: "r2",
    name: "Omelette",
    ingredients: [
      { ingredientId: "ing3", quantity: 3, name: "Eggs", unit: "pieces" },
    ],
  },
]

beforeEach(() => {
  jest.clearAllMocks()
  mockFetchRecipes.mockResolvedValue([...mockRecipes])
})

describe("RecipesTable", () => {
  it("renders a loading state initially", () => {
    mockFetchRecipes.mockReturnValue(new Promise(() => {})) // never resolves
    renderWithProviders(<RecipesTable />)
    expect(screen.getByText(/loading recipes/i)).toBeInTheDocument()
  })

  it("renders all recipes in the table", async () => {
    renderWithProviders(<RecipesTable />)

    await waitFor(() => {
      expect(screen.getByText("Pancakes")).toBeInTheDocument()
    })

    expect(screen.getByText("Omelette")).toBeInTheDocument()
  })

  it("renders column headers", async () => {
    renderWithProviders(<RecipesTable />)

    await waitFor(() => {
      expect(screen.getByText("Recipe Name")).toBeInTheDocument()
    })

    expect(screen.getByText("Ingredients")).toBeInTheDocument()
  })

  it("displays ingredient names as badges", async () => {
    renderWithProviders(<RecipesTable />)

    await waitFor(() => {
      expect(screen.getByText("Pancakes")).toBeInTheDocument()
    })

    expect(screen.getByText("Flour")).toBeInTheDocument()
    expect(screen.getByText("Sugar")).toBeInTheDocument()
    // Eggs appears in both Pancakes and Omelette rows
    expect(screen.getAllByText("Eggs")).toHaveLength(2)
  })

  it("shows empty state when there are no recipes", async () => {
    mockFetchRecipes.mockResolvedValue([])
    renderWithProviders(<RecipesTable />)

    await waitFor(() => {
      expect(screen.getByText(/no recipes yet/i)).toBeInTheDocument()
    })
  })

  it("calls deleteRecipe when the delete button is clicked", async () => {
    mockDeleteRecipe.mockResolvedValue(undefined)
    const user = userEvent.setup()

    renderWithProviders(<RecipesTable />)

    await waitFor(() => {
      expect(screen.getByText("Pancakes")).toBeInTheDocument()
    })

    const deleteButton = screen.getAllByLabelText("Delete Pancakes")[0]
    await user.click(deleteButton)

    expect(mockDeleteRecipe).toHaveBeenCalled()
    expect(mockDeleteRecipe.mock.calls[0][0]).toBe("r1")
  })

  it("optimistically removes recipe from table on delete", async () => {
    // After deletion, refetch returns the list without the deleted recipe
    mockDeleteRecipe.mockResolvedValue(undefined)
    const user = userEvent.setup()

    renderWithProviders(<RecipesTable />)

    await waitFor(() => {
      expect(screen.getByText("Pancakes")).toBeInTheDocument()
    })

    // After delete is called, subsequent fetches return the filtered list
    mockFetchRecipes.mockResolvedValue([mockRecipes[1]])

    const deleteButton = screen.getAllByLabelText("Delete Pancakes")[0]
    await user.click(deleteButton)

    await waitFor(() => {
      expect(screen.queryByText("Pancakes")).not.toBeInTheDocument()
    })

    expect(screen.getByText("Omelette")).toBeInTheDocument()
  })

  it("shows error toast when delete fails", async () => {
    const { toast } = jest.requireMock("sonner")
    mockDeleteRecipe.mockRejectedValue(new Error("Failed to delete recipe"))
    const user = userEvent.setup()

    renderWithProviders(<RecipesTable />)

    await waitFor(() => {
      expect(screen.getByText("Pancakes")).toBeInTheDocument()
    })

    const deleteButton = screen.getAllByLabelText("Delete Pancakes")[0]
    await user.click(deleteButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to delete recipe")
    })
  })

  it("filters recipes when typing in the search input", async () => {
    const user = userEvent.setup()

    renderWithProviders(<RecipesTable />)

    await waitFor(() => {
      expect(screen.getByText("Pancakes")).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(
      "Search by name or ingredient…"
    )
    await user.type(searchInput, "Omelette")

    expect(screen.getByText("Omelette")).toBeInTheDocument()
    expect(screen.queryByText("Pancakes")).not.toBeInTheDocument()
  })

  it("filters recipes by ingredient name", async () => {
    const user = userEvent.setup()

    renderWithProviders(<RecipesTable />)

    await waitFor(() => {
      expect(screen.getByText("Pancakes")).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(
      "Search by name or ingredient…"
    )
    await user.type(searchInput, "Flour")

    // Pancakes has Flour, Omelette does not
    expect(screen.getByText("Pancakes")).toBeInTheDocument()
    expect(screen.queryByText("Omelette")).not.toBeInTheDocument()
  })

  it("shows all recipes when search is cleared", async () => {
    const user = userEvent.setup()

    renderWithProviders(<RecipesTable />)

    await waitFor(() => {
      expect(screen.getByText("Pancakes")).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(
      "Search by name or ingredient…"
    )
    await user.type(searchInput, "Omelette")

    expect(screen.queryByText("Pancakes")).not.toBeInTheDocument()

    await user.clear(searchInput)

    expect(screen.getByText("Pancakes")).toBeInTheDocument()
    expect(screen.getByText("Omelette")).toBeInTheDocument()
  })
})
