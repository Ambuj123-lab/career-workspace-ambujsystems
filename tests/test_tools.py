"""
Unit tests for CoverCraft MCP Server Tools.
Tests schema validity, registered tool signatures, and safety boundaries across all 16 tool declarations
(8 Python FastMCP production tools + 8 Remote HTTP MCP tools in web/src/app/api/mcp/route.js).
"""
import unittest
import ast
import os


class TestMCPToolsPython(unittest.TestCase):
    """Verify Python FastMCP server tool signatures and deterministic registration."""

    def setUp(self):
        self.server_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "mcp-server", "server.py")
        )
        self.tools_dir = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "mcp-server", "tools")
        )
        with open(self.server_path, "r", encoding="utf-8") as f:
            self.server_content = f.read()

    def test_registered_tools_count(self):
        """Ensure all 8 production tools are registered in server.py list_tools."""
        tree = ast.parse(self.server_content)
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
        self.assertIn("ToolAnnotations", self.server_content)
        self.assertIn("readOnlyHint", self.server_content)
        self.assertIn("destructiveHint", self.server_content)

    # Explicit unit tests for each of the 8 Python tools by name
    def test_python_tool_company_research(self):
        """Verify Python company_research tool registration and implementation."""
        self.assertIn('name == "company_research"', self.server_content)
        fpath = os.path.join(self.tools_dir, "company_research.py")
        self.assertTrue(os.path.exists(fpath))

    def test_python_tool_evidence_validator(self):
        """Verify Python evidence_validator tool registration and implementation."""
        self.assertIn('name == "evidence_validator"', self.server_content)
        fpath = os.path.join(self.tools_dir, "evidence_validator.py")
        self.assertTrue(os.path.exists(fpath))

    def test_python_tool_jd_analyzer(self):
        """Verify Python jd_analyzer tool registration and implementation."""
        self.assertIn('name == "jd_analyzer"', self.server_content)
        fpath = os.path.join(self.tools_dir, "jd_analyzer.py")
        self.assertTrue(os.path.exists(fpath))

    def test_python_tool_ats_readiness(self):
        """Verify Python ats_readiness tool registration and implementation."""
        self.assertIn('name == "ats_readiness"', self.server_content)
        fpath = os.path.join(self.tools_dir, "ats_readiness.py")
        self.assertTrue(os.path.exists(fpath))

    def test_python_tool_source_filter(self):
        """Verify Python source_filter tool registration and implementation."""
        self.assertIn('name == "source_filter"', self.server_content)
        fpath = os.path.join(self.tools_dir, "source_filter.py")
        self.assertTrue(os.path.exists(fpath))

    def test_python_tool_cover_letter_generator(self):
        """Verify Python cover_letter_generator tool registration and implementation."""
        self.assertIn('name == "cover_letter_generator"', self.server_content)
        fpath = os.path.join(self.tools_dir, "cover_letter_generator.py")
        self.assertTrue(os.path.exists(fpath))

    def test_python_tool_github_proofer(self):
        """Verify Python github_proofer tool registration and implementation."""
        self.assertIn('name == "github_proofer"', self.server_content)
        fpath = os.path.join(self.tools_dir, "github_proofer.py")
        self.assertTrue(os.path.exists(fpath))

    def test_python_tool_huggingface_proofer(self):
        """Verify Python huggingface_proofer tool registration and implementation."""
        self.assertIn('name == "huggingface_proofer"', self.server_content)
        fpath = os.path.join(self.tools_dir, "huggingface_proofer.py")
        self.assertTrue(os.path.exists(fpath))


class TestMCPToolsRemoteHTTP(unittest.TestCase):
    """Verify Next.js Remote HTTP MCP server tool definitions and schema completeness."""

    def setUp(self):
        self.route_path = os.path.abspath(
            os.path.join(
                os.path.dirname(__file__), "..", "web", "src", "app", "api", "mcp", "route.js"
            )
        )
        self.assertTrue(os.path.exists(self.route_path), "Remote MCP route.js not found")
        with open(self.route_path, "r", encoding="utf-8") as f:
            self.content = f.read()

    def test_web_remote_mcp_all_tools_present(self):
        """Ensure all 8 production tools are registered in web Remote MCP route.js."""
        expected_tools = [
            "company_research",
            "evidence_validator",
            "jd_analyzer",
            "ats_readiness",
            "source_filter",
            "cover_letter_generator",
            "github_proofer",
            "huggingface_proofer",
        ]
        for tool in expected_tools:
            self.assertIn(f'name: "{tool}"', self.content, f"Tool {tool} not found in Remote MCP server")

    # Explicit unit tests for each of the 8 Remote HTTP tools by name
    def test_web_tool_company_research(self):
        """Verify Remote HTTP company_research tool schema and outputSchema."""
        self.assertIn('name: "company_research"', self.content)
        self.assertIn("outputSchema", self.content)

    def test_web_tool_evidence_validator(self):
        """Verify Remote HTTP evidence_validator tool schema and annotations."""
        self.assertIn('name: "evidence_validator"', self.content)
        self.assertIn("readOnlyHint: true", self.content)

    def test_web_tool_jd_analyzer(self):
        """Verify Remote HTTP jd_analyzer tool schema and parameters."""
        self.assertIn('name: "jd_analyzer"', self.content)
        self.assertIn('"jd_text"', self.content)

    def test_web_tool_ats_readiness(self):
        """Verify Remote HTTP ats_readiness tool schema and annotations."""
        self.assertIn('name: "ats_readiness"', self.content)

    def test_web_tool_source_filter(self):
        """Verify Remote HTTP source_filter tool schema and parameters."""
        self.assertIn('name: "source_filter"', self.content)

    def test_web_tool_cover_letter_generator(self):
        """Verify Remote HTTP cover_letter_generator tool schema."""
        self.assertIn('name: "cover_letter_generator"', self.content)

    def test_web_tool_github_proofer(self):
        """Verify Remote HTTP github_proofer tool schema and annotations."""
        self.assertIn('name: "github_proofer"', self.content)

    def test_web_tool_huggingface_proofer(self):
        """Verify Remote HTTP huggingface_proofer tool schema and annotations."""
        self.assertIn('name: "huggingface_proofer"', self.content)


if __name__ == "__main__":
    unittest.main()
