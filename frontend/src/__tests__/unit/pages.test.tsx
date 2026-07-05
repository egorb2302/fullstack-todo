import { describe, vi, beforeEach, it, expect } from "vitest";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router';
import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import * as api from '../../api/api';
import type { Todo } from "../../types/types";
import TodoList from "../../pages/TodoList";
import { userEvent } from "@testing-library/user-event";
import TodoDetails from "../../pages/TodoDetails";
import Profile from "../../pages/Profile";
import NotFound from "../../pages/NotFound";
import Login from '../../pages/Login';
import Signup from '../../pages/SignUp';

vi.mock('../../api/api', () => ({
    getAllTodos: vi.fn(),
    deleteTodo: vi.fn(),
    patchTodo: vi.fn(),
    getCurrentUser: vi.fn(),
    getTodo: vi.fn(),
    logout: vi.fn(),
    login: vi.fn(),
    registerAPI: vi.fn()
}))

describe('Pages tests', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        vi.clearAllMocks();
    });

    const renderComponent = (el: ReactNode) => {
        return render(
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    {el}
                </BrowserRouter>
            </QueryClientProvider>
        )
    }

    describe('Todolist Page', () => {
        const allTodos: Todo[] = [
            {
                id: 1,
                title: 'title',
                description: 'description',
                isCompleted: false
            }
        ]

        it('should render todolist page', async () => {
            vi.mocked(api.getAllTodos).mockResolvedValue(allTodos)
            renderComponent(<TodoList />)

            await waitFor(() => {
                expect(screen.getByText('title')).toBeInTheDocument()
            })
        })

        it('should rerender completed state on click', async () => {
            const updatedTodos = [
                {
                    ...allTodos[0],
                    isCompleted: true,
                },
                ...allTodos.slice(1),
            ];

            vi.mocked(api.getAllTodos)
                .mockResolvedValueOnce(allTodos)      
                .mockResolvedValueOnce(updatedTodos);

            vi.mocked(api.patchTodo).mockResolvedValue(updatedTodos[0]);

            renderComponent(<TodoList />);

            expect(await screen.findByText('title')).toBeInTheDocument();

            await userEvent.click(
                screen.getByRole('button', { name: /complete/i })
            );

            await waitFor(() => {
                expect(api.patchTodo).toHaveBeenCalledTimes(1);
            });

            await waitFor(() => {
                expect(screen.getByText('Completed')).toBeInTheDocument();
            });
        })

        it('should open modal on click', async () => {
            vi.mocked(api.getAllTodos).mockResolvedValue(allTodos)
            renderComponent(<TodoList />)
            expect(await screen.findByText('title')).toBeInTheDocument();

            await userEvent.click(screen.getByRole('button', { name: '+ add task'}))

            await waitFor(() => {
                expect(screen.getByText("New task")).toBeInTheDocument()
            })
        })
    })

    describe('TodoDetails Page', () => {
        const todo: Todo = {
                id: 1,
                title: 'title',
                description: 'description',
                isCompleted: false
            }

        it("should render the details page", async () => {
            vi.mocked(api.getTodo).mockResolvedValue(todo);

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter initialEntries={["/todos/1"]}>
                        <Routes>
                            <Route path="/todos/:id" element={<TodoDetails />} />
                        </Routes>
                    </MemoryRouter>
                </QueryClientProvider>
            );

            expect(await screen.findByText("title")).toBeInTheDocument();
            expect(screen.getByText("description")).toBeInTheDocument();
            expect(screen.getByText("In Progress")).toBeInTheDocument();

            expect(api.getTodo).toHaveBeenCalledWith(1);
        });

        it("should show invalid id message", () => {
            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter initialEntries={["/todos/abc"]}>
                        <Routes>
                            <Route path="/todos/:id" element={<TodoDetails />} />
                        </Routes>
                    </MemoryRouter>
                </QueryClientProvider>
            );

            expect(screen.getByText("Invalid todo ID")).toBeInTheDocument();
        });
    })

    describe("Profile Page", () => {
        const user = {
            id: 1,
            name: "John Doe",
            email: "example@gmail.com",
        };

        beforeEach(() => {
            vi.clearAllMocks();
        });

        it("should render profile information", async () => {
            vi.mocked(api.getCurrentUser).mockResolvedValue(user);

            renderComponent(<Profile />);

            expect(await screen.findByText("John Doe")).toBeInTheDocument();
            expect(screen.getByText("example@gmail.com")).toBeInTheDocument();
            expect(screen.getByText("1")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();

            expect(api.getCurrentUser).toHaveBeenCalledTimes(1);
        });

        it("should show loading state", () => {
            vi.mocked(api.getCurrentUser).mockImplementation(
                () => new Promise(() => {})
            );

            renderComponent(<Profile />);

            expect(screen.getByText(/loading/i)).toBeInTheDocument();
        });

        it("should show error state", async () => {
            vi.mocked(api.getCurrentUser).mockRejectedValue(
                new Error("Server error")
            );

            renderComponent(<Profile />);

            expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
        });

        it("should call logout when logout button is clicked", async () => {
            vi.mocked(api.getCurrentUser).mockResolvedValue(user);
            vi.mocked(api.logout).mockResolvedValue(undefined);

            renderComponent(<Profile />);

            await screen.findByText("John Doe");

            await userEvent.click(
                screen.getByRole("button", { name: /logout/i })
            );

            await waitFor(() => {
                expect(api.logout).toHaveBeenCalledTimes(1);
            });
        });
    })

    describe("Not Found Page", () => {
        it("should render the 404 page", () => {
            renderComponent(<NotFound />);

            expect(screen.getByRole("heading", { name: /404/i })).toBeInTheDocument();
            expect(
                screen.getByRole("heading", { name: /page not found/i })
            ).toBeInTheDocument();
        });

        it("should render back to home link", () => {
            renderComponent(<NotFound />);

            const link = screen.getByRole("link", {
                name: /back to home/i,
            });

            expect(link).toBeInTheDocument();
        });

        it("should navigate to home page", () => {
            renderComponent(<NotFound />);

            const link = screen.getByRole("link", {
                name: /back to home/i,
            });

            expect(link).toHaveAttribute("href", "/");
        });

        it("should display the 404 code", () => {
            renderComponent(<NotFound />);

            expect(screen.getByText("404")).toBeInTheDocument();
        });

        it("should display page not found message", () => {
            renderComponent(<NotFound />);

            expect(screen.getByText(/page not found/i)).toBeInTheDocument();
        });
    })

    describe('Login Page', () => {
        it("should render login page", () => {
            renderComponent(<Login />);

            expect(
                screen.getByRole("heading", { name: /login/i })
            ).toBeInTheDocument();
        });

        it("should render form inputs", () => {
            renderComponent(<Login />);

            expect(screen.getAllByRole("textbox")[0]).toBeInTheDocument();
            expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        });

        it("should render login button", () => {
            renderComponent(<Login />);

            expect(
                screen.getByRole("button", { name: /^login$/i })
            ).toBeInTheDocument();
        });

        it("should render sign up link", () => {
            renderComponent(<Login />);

            const link = screen.getByRole("link", {
                name: /sign up/i,
            });

            expect(link).toHaveAttribute("href", "/auth/register");
        });

        it("should validate password length", async () => {
            renderComponent(<Login />);

            await userEvent.type(
                screen.getByLabelText(/email/i),
                "john@example.com"
            );

            await userEvent.type(
                screen.getByLabelText(/password/i),
                "123"
            );

            await userEvent.click(
                screen.getByRole("button", { name: /^login$/i })
            );

            expect(
                await screen.findByText(
                    "Min length of password is 6 chars"
                )
            ).toBeInTheDocument();

            expect(api.login).not.toHaveBeenCalled();
        });

        it("should submit login form", async () => {
            vi.mocked(api.login).mockResolvedValue(undefined);

            renderComponent(<Login />);

            await userEvent.type(
                screen.getByLabelText(/email/i),
                "john@example.com"
            );

            await userEvent.type(
                screen.getByLabelText(/password/i),
                "123456"
            );

            await userEvent.click(
                screen.getByRole("button", { name: /^login$/i })
            );

            await waitFor(() => {
                expect(api.login).toHaveBeenCalledWith({
                    email: "john@example.com",
                    password: "123456",
                });
            });
        });

        it("should handle login error", async () => {
            vi.mocked(api.login).mockRejectedValue(
                new Error("Unauthorized")
            );

            renderComponent(<Login />);

            await userEvent.type(
                screen.getByLabelText(/email/i),
                "john@example.com"
            );

            await userEvent.type(
                screen.getByLabelText(/password/i),
                "123456"
            );

            await userEvent.click(
                screen.getByRole("button", { name: /^login$/i })
            );

            await waitFor(() => {
                expect(api.login).toHaveBeenCalled();
            });
        });
    })

    describe("Sign Up Page", () => {
        const registerData = {
            name: "John Doe",
            email: "john@example.com",
            password: "123456",
            confirmPass: "123456",
        };

        beforeEach(() => {
            vi.clearAllMocks();
        });

        it("should render register page", () => {
            renderComponent(<Signup />);

            expect(
                screen.getByRole("heading", { name: /register/i })
            ).toBeInTheDocument();
        });

        it("should render all form inputs", () => {
            renderComponent(<Signup />);

            expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
        });

        it("should render register button", () => {
            renderComponent(<Signup />);

            expect(
                screen.getByRole("button", { name: /^register$/i })
            ).toBeInTheDocument();
        });

        it("should render login link", () => {
            renderComponent(<Signup />);

            const link = screen.getByRole("link", {
                name: /already have account\? login/i,
            });

            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute("href", "/auth/login");
        });

        it("should validate password length", async () => {
            renderComponent(<Signup />);

            await userEvent.type(
                screen.getByLabelText(/name/i),
                "John Doe"
            );

            await userEvent.type(
                screen.getByLabelText(/email/i),
                "john@example.com"
            );

            await userEvent.type(
                screen.getByLabelText(/^password/i),
                "123"
            );

            await userEvent.type(
                screen.getByLabelText(/confirm password/i),
                "123"
            );

            await userEvent.click(
                screen.getByRole("button", { name: /^register$/i })
            );

            expect(
                await screen.findByText(
                    "Min length fror password is 6 chars"
                )
            ).toBeInTheDocument();

            expect(api.registerAPI).not.toHaveBeenCalled();
        });

        it("should validate password confirmation", async () => {
            renderComponent(<Signup />);

            await userEvent.type(
                screen.getByLabelText(/name/i),
                "John Doe"
            );

            await userEvent.type(
                screen.getByLabelText(/email/i),
                "john@example.com"
            );

            await userEvent.type(
                screen.getByLabelText(/^password/i),
                "123456"
            );

            await userEvent.type(
                screen.getByLabelText(/confirm password/i),
                "654321"
            );

            await userEvent.click(
                screen.getByRole("button", { name: /^register$/i })
            );

            expect(
                await screen.findByText("Passwords is compare")
            ).toBeInTheDocument();

            expect(api.registerAPI).not.toHaveBeenCalled();
        });

        it("should submit registration form", async () => {
            vi.mocked(api.registerAPI).mockResolvedValue(undefined);

            renderComponent(<Signup />);

            await userEvent.type(
                screen.getByLabelText(/name/i),
                registerData.name
            );

            await userEvent.type(
                screen.getByLabelText(/email/i),
                registerData.email
            );

            await userEvent.type(
                screen.getByLabelText(/^password/i),
                registerData.password
            );

            await userEvent.type(
                screen.getByLabelText(/confirm password/i),
                registerData.confirmPass
            );

            await userEvent.click(
                screen.getByRole("button", { name: /^register$/i })
            );

            await waitFor(() => {
                expect(api.registerAPI).toHaveBeenCalledWith({
                    name: registerData.name,
                    email: registerData.email,
                    password: registerData.password,
                });
            });
        });

        it("should handle registration error", async () => {
            vi.mocked(api.registerAPI).mockRejectedValue(
                new Error("Registration failed")
            );

            renderComponent(<Signup />);

            await userEvent.type(
                screen.getByLabelText(/name/i),
                registerData.name
            );

            await userEvent.type(
                screen.getByLabelText(/email/i),
                registerData.email
            );

            await userEvent.type(
                screen.getByLabelText(/^password/i),
                registerData.password
            );

            await userEvent.type(
                screen.getByLabelText(/confirm password/i),
                registerData.confirmPass
            );

            await userEvent.click(
                screen.getByRole("button", { name: /^register$/i })
            );

            await waitFor(() => {
                expect(api.registerAPI).toHaveBeenCalledTimes(1);
            });
        });
    });
})