import { Routes, Route } from "react-router";
import TodoList from "./pages/TodoList";
import TodoDetails from "./pages/TodoDetails";

export default function App() {
  return (
    <Routes>
      <Route path="/todos" element={<TodoList />} />
      <Route index element={<TodoList />} />
      <Route path={"/todos/:id"} element={<TodoDetails />} />
    </Routes>
  )
}
