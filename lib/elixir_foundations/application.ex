defmodule ElixirFoundations.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Starts a worker by calling: ElixirFoundations.Counter.start_link(opts)
      # We provide an initial value of 0 and register it globally.
      {ElixirFoundations.Counter, [initial_value: 0, name: ElixirFoundations.Counter]}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: ElixirFoundations.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
