import React from "react"
import { Link } from "react-router-dom"

function Home() {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-blue-500">Welcome to Insta Clone</h1>
      <div className="mt-4">
        <Link to="/login" className="text-blue-500 underline">
          Login
        </Link>{" "}
        |{" "}
        <Link to="/signup" className="text-blue-500 underline">
          Sign Up
        </Link>
      </div>
    </div>
  )
}

export default Home
