"""
Unit tests for CoverCraft MCP Server Tools.
Tests schema validity, registered tool signatures, and safety boundaries across all 7 tools.
"""
import unittest
import ast
import os


class TestMCPTools(unittest.TestCase):
    """Verify tool signatures and deterministic registration."""

    def setUp(self):
        self.server_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "mcp-server", "server.py")
        )
        self.tools_dir = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "mcp-server", "tools")
        )

    def test_registered_tools_count(self):
        """Ensure all 8 production tools are registered in server.py list_tools."""
        with open(self.server_path, "r", encoding="utf-8") as f:
            tree = ast.parse(f.read())

        tools = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and getattr(node.func, "id", "") == "Tool":
                for kw in node.keywords:
                    if kw.arg == "name" and isinstance(kw.value, ast.Constant):
                        tools.append(kw.value.value)

        expected = [
            "company_research",
            "evidence_validator",
            "jd_analyzer",
            "ats_readiness",
            "source_filter",
            "cover_letter_generator",
            "github_proofer",
            "huggingface_proofer",
        ]
        self.assertEqual(len(tools), 8)
        self.assertListEqual(tools, expected)

    def test_all_tool_files_exist(self):
        """Ensure implementation files exist for every declared tool."""
        expected_files = [
            "company_research.py",
            "evidence_validator.py",
            "jd_analyzer.py",
            "ats_readiness.py",
            "source_filter.py",
            "cover_letter_generator.py",
            "github_proofer.py",
            "huggingface_proofer.py",
        ]
        for fname in expected_files:
            fpath = os.path.join(self.tools_dir, fname)
            self.assertTrue(os.path.exists(fpath), f"Missing tool file: {fname}")

    def test_tool_annotations_present(self):
        """Ensure ToolAnnotations are declared for safety hints on tools."""
        with open(self.server_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("ToolAnnotations", content)
        self.assertIn("readOnlyHint", content)
        self.assertIn("destructiveHint", content)


if __name__ == "__main__":
    unittest.main()

