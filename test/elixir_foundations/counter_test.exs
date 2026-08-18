defmodule ElixirFoundations.CounterTest do
  use ExUnit.Case, async: true
  alias ElixirFoundations.Counter

  setup do
    # Start an isolated, anonymous GenServer for each test.
    # Passing name: nil ensures it doesn't conflict with the globally 
    # registered process started by the Application supervisor, allowing 
    # `async: true` tests to run safely concurrently.
    {:ok, pid} = Counter.start_link(initial_value: 0, name: nil)
    %{counter_pid: pid}
  end

  test "starts with initial value", %{counter_pid: pid} do
    assert Counter.get_value(pid) == 0
  end

  test "increments the counter", %{counter_pid: pid} do
    assert Counter.increment(pid) == 1
    assert Counter.get_value(pid) == 1
  end

  test "decrements the counter asynchronously", %{counter_pid: pid} do
    :ok = Counter.decrement(pid)
    
    # Since `cast` is async, we can force a synchronization to ensure 
    # it was processed by making a synchronous `call` right after.
    # GenServers process messages strictly in the order they arrive.
    assert Counter.get_value(pid) == -1
  end
end
