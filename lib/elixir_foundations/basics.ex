defmodule ElixirFoundations.Basics do
  @moduledoc """
  Demonstrates fundamental Elixir concepts including pattern matching,
  function clauses, guards, and the pipe operator.
  """

  @doc """
  Demonstrates the pipe operator `|>` by taking a string,
  trimming it, upcasing it, and returning the result.
  """
  def process_string(str) do
    str
    |> String.trim()
    |> String.upcase()
  end

  @doc """
  Demonstrates pattern matching with tuples.
  """
  def handle_result({:ok, value}), do: "Success: #{value}"
  def handle_result({:error, reason}), do: "Failure: #{reason}"

  @doc """
  Demonstrates function clauses and guard clauses (`when`).
  """
  def categorize_number(n) when is_integer(n) and n > 0, do: :positive
  def categorize_number(n) when is_integer(n) and n < 0, do: :negative
  def categorize_number(0), do: :zero
  def categorize_number(_), do: :not_an_integer
end
