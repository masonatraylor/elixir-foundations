defmodule ElixirFoundations.BasicsTest do
  use ExUnit.Case, async: true
  alias ElixirFoundations.Basics

  describe "process_string/1" do
    test "trims and upcases" do
      assert Basics.process_string("  hello world  ") == "HELLO WORLD"
    end
  end

  describe "handle_result/1" do
    test "handles :ok tuple" do
      assert Basics.handle_result({:ok, "data"}) == "Success: data"
    end

    test "handles :error tuple" do
      assert Basics.handle_result({:error, "not found"}) == "Failure: not found"
    end
  end

  describe "categorize_number/1" do
    test "positive integers" do
      assert Basics.categorize_number(5) == :positive
    end

    test "negative integers" do
      assert Basics.categorize_number(-3) == :negative
    end

    test "zero" do
      assert Basics.categorize_number(0) == :zero
    end

    test "non-integers" do
      assert Basics.categorize_number(3.14) == :not_an_integer
      assert Basics.categorize_number("hello") == :not_an_integer
    end
  end
end
