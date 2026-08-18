defmodule ElixirFoundations.Concurrency do
  @moduledoc """
  Demonstrates basic Elixir/BEAM process creation and message passing.
  """

  @doc """
  Spawns a process that echoes any message it receives back to the sender.
  Returns the PID of the spawned process.
  """
  def start_echo_process do
    spawn(fn -> echo_loop() end)
  end

  defp echo_loop do
    receive do
      {:ping, sender, ref} ->
        send(sender, {:pong, ref})
        echo_loop() # Recursively call to keep the process alive
      :stop ->
        :ok
    end
  end
end
