import { Routes, Route } from "react-router";
import TodoList from "./pages/TodoList";
import TodoDetails from "./pages/TodoDetails";
import Signup from "./pages/SignUp";
import Login from "./pages/Login";

export default function App() {
  return (
    <Routes>
      <Route path="/todos" element={<TodoList />} />
      <Route index element={<TodoList />} />
      <Route path={"/todos/:id"} element={<TodoDetails />} />
      <Route path={"/auth/register"} element={<Signup />}/>
      <Route path={"/auth/login"} element={<Login />} />
    </Routes>
  )
}
