defmodule ElixirFoundationsTest do
  use ExUnit.Case
  doctest ElixirFoundations

  test "greets the world" do
    assert ElixirFoundations.hello() == :world
  end
end
