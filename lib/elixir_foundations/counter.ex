defmodule ElixirFoundations.Counter do
  @moduledoc """
  A simple GenServer demonstrating state management and OTP behaviors.
  """
  use GenServer

  # --- Client API ---

  @doc """
  Starts the Counter process.
  Accepts options like `:initial_value` (default 0) and `:name` (default is the module name).
  Passing `name: nil` starts an anonymous process (useful for testing).
  """
  def start_link(opts \\ []) do
    initial_value = Keyword.get(opts, :initial_value, 0)
    name = Keyword.get(opts, :name, __MODULE__)

    if name do
      GenServer.start_link(__MODULE__, initial_value, name: name)
    else
      GenServer.start_link(__MODULE__, initial_value)
    end
  end

  @doc """
  Gets the current value of the counter synchronously.
  Accepts a pid or a registered name.
  """
  def get_value(pid \\ __MODULE__) do
    GenServer.call(pid, :get_value)
  end

  @doc """
  Increments the counter synchronously.
  """
  def increment(pid \\ __MODULE__) do
    GenServer.call(pid, :increment)
  end

  @doc """
  Decrements the counter asynchronously (fire and forget).
  """
  def decrement(pid \\ __MODULE__) do
    GenServer.cast(pid, :decrement)
  end

  # --- Server Callbacks ---

  @impl true
  def init(initial_value) do
    {:ok, initial_value}
  end

  @impl true
  def handle_call(:get_value, _from, state) do
    # Reply with the current state, and keep the state the same
    {:reply, state, state}
  end

  @impl true
  def handle_call(:increment, _from, state) do
    new_state = state + 1
    # Reply with the new state, and pass the new state to the next recursive loop
    {:reply, new_state, new_state}
  end

  @impl true
  def handle_cast(:decrement, state) do
    new_state = state - 1
    # No reply for cast, pass the new state to the next recursive loop
    {:noreply, new_state}
  end
end
