"""
AI Cover Letter Generator - MCP Server
4 Tools: company_research, evidence_validator, jd_analyzer, ats_readiness

Transport: Stdio transport (Standard I/O)
Dependencies: pip install "mcp[cli]" google-generativeai tavily-python python-dotenv

Run: python server.py
"""
import asyncio
import json
import logging
import sys
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent

from tools.company_research import company_research
from tools.evidence_validator import evidence_validator
from tools.jd_analyzer import jd_analyzer
from tools.ats_readiness import ats_readiness
from config import MAX_JD_CHARS, MAX_RESUME_CHARS, MAX_COMPANY_NAME_CHARS

# Configure server-side diagnostic logger (outputs to stderr to protect stdio JSON-RPC transport on stdout)
logging.basicConfig(
    stream=sys.stderr,
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("covercraft-mcp")

# Create MCP Server
server = Server("ai-cover-letter-mcp")


@server.list_tools()
async def list_tools() -> list[Tool]:
    """Register all 4 MCP tools."""
    return [
        Tool(
            name="company_research",
            description=(
                "Search the web for company information using Tavily. "
                "Returns grounded data with source citations. "
                "Every claim is traceable to a source URL."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "company_name": {
                        "type": "string",
                        "description": f"Target company name (max {MAX_COMPANY_NAME_CHARS} chars)",
                    },
                    "focus_areas": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Optional focus: tech_stack, culture, recent_news",
                    },
                },
                "required": ["company_name"],
            },
        ),
        Tool(
            name="evidence_validator",
            description=(
                "Validate AI-generated claims against actual source data. "
                "Implements Claim Ledger pattern. "
                "Returns VERIFIED / PARTIAL / UNSUPPORTED per claim."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "claims": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of claims to validate",
                    },
                    "sources": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "url": {"type": "string"},
                                "title": {"type": "string"},
                                "content": {"type": "string"},
                            },
                        },
                        "description": "Source data to validate against",
                    },
                },
                "required": ["claims", "sources"],
            },
        ),
        Tool(
            name="jd_analyzer",
            description=(
                "Evidence-backed JD matching. Extracts skills from JD, "
                "matches each against resume with ACTUAL evidence. "
                "Returns STRONG_MATCH / PARTIAL_MATCH / TRANSFERABLE / MISSING per skill."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "jd_text": {
                        "type": "string",
                        "description": f"Full job description text (max {MAX_JD_CHARS} chars)",
                    },
                    "resume_text": {
                        "type": "string",
                        "description": f"User's resume/experience text (max {MAX_RESUME_CHARS} chars)",
                    },
                },
                "required": ["jd_text", "resume_text"],
            },
        ),
        Tool(
            name="ats_readiness",
            description=(
                "Honest ATS readiness check (NOT a fake score). "
                "Returns individual checks: keyword coverage, skills, evidence, length. "
                "Includes disclaimer: heuristic analysis, not actual ATS vendor score."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "letter_text": {
                        "type": "string",
                        "description": "Generated cover letter text",
                    },
                    "jd_text": {
                        "type": "string",
                        "description": "Job description text",
                    },
                },
                "required": ["letter_text", "jd_text"],
            },
        ),
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    """Route tool calls to their implementations with structured error handling and internal diagnostics."""
    try:
        if name == "company_research":
            result = await company_research(
                company_name=arguments["company_name"],
                focus_areas=arguments.get("focus_areas"),
            )
        elif name == "evidence_validator":
            result = await evidence_validator(
                claims=arguments["claims"],
                sources=arguments["sources"],
            )
        elif name == "jd_analyzer":
            result = await jd_analyzer(
                jd_text=arguments["jd_text"],
                resume_text=arguments["resume_text"],
            )
        elif name == "ats_readiness":
            result = await ats_readiness(
                letter_text=arguments["letter_text"],
                jd_text=arguments["jd_text"],
            )
        else:
            logger.warning(f"Rejected invocation for unregistered tool: {name}")
            result = {
                "error": {
                    "code": "UNKNOWN_TOOL",
                    "message": f"Tool '{name}' is not registered on this MCP server.",
                    "registered_tools": ["company_research", "evidence_validator", "jd_analyzer", "ats_readiness"],
                }
            }
            return [TextContent(type="text", text=json.dumps(result, indent=2))]
        
        return [TextContent(type="text", text=json.dumps(result, indent=2))]
    
    except KeyError as e:
        logger.error(f"Missing required parameter for tool '{name}': {e}", exc_info=True)
        sanitized_error = {
            "error": {
                "code": "INVALID_ARGUMENT",
                "message": f"Missing required parameter: {str(e)}",
                "tool": name,
            }
        }
        return [TextContent(type="text", text=json.dumps(sanitized_error, indent=2))]
    except Exception as e:
        # Internal log captures full traceback on stderr for production diagnostics
        logger.error(f"Internal execution failure in tool '{name}': {e}", exc_info=True)
        # Client receives structured, sanitized error payload without raw internal leaks
        sanitized_error = {
            "error": {
                "code": "INTERNAL_TOOL_ERROR",
                "message": "Tool execution encountered an unexpected internal error. Consult server diagnostic logs.",
                "tool": name,
            }
        }
        return [TextContent(type="text", text=json.dumps(sanitized_error, indent=2))]


async def main():
    """Start MCP server with stdio transport."""
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())
