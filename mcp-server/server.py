"""
AI Cover Letter Generator - MCP Server
7 Tools: company_research, evidence_validator, jd_analyzer, ats_readiness, source_filter, cover_letter_generator

Transport: Stdio transport (Standard I/O) / Streamable HTTP SSE capable
Dependencies: pip install "mcp[cli]" google-generativeai tavily-python python-dotenv

Run: python server.py
"""
import asyncio
import json
import logging
import sys
import argparse
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent, ToolAnnotations
from tools.github_proofer import github_proofer

from tools.company_research import company_research
from tools.evidence_validator import evidence_validator
from tools.jd_analyzer import jd_analyzer
from tools.ats_readiness import ats_readiness
from tools.source_filter import source_filter
from tools.cover_letter_generator import cover_letter_generator
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
    """Register all 7 MCP tools."""
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
        Tool(
            name="source_filter",
            description=(
                "Evaluate, rank, and filter web research sources based on domain credibility "
                "and outdated news & stale tech filtering. Tier 1: Official company domains & verified newsrooms, "
                "Tier 2: Job boards & tech media, Tier 3: Noise/scrapers."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "sources": {
                        "type": "array",
                        "items": {"type": "object"},
                        "description": "List of source objects with url, title, and optional snippet",
                    },
                    "company_domain": {
                        "type": "string",
                        "description": "Optional primary domain of target company",
                    },
                },
                "required": ["sources"],
            },
        ),
        Tool(
            name="cover_letter_generator",
            description=(
                "Generate an evidence-grounded cover letter strictly bounded by candidate's verified skills "
                "and approved company research. Returns structured paragraphs with in-line citation markers."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "candidate_name": {"type": "string"},
                    "role": {"type": "string"},
                    "company": {"type": "string"},
                    "matched_skills": {
                        "type": "array",
                        "items": {"type": "object"},
                        "description": "List of matched skills with evidence quotes",
                    },
                    "approved_company_facts": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Optional list of verified company facts",
                    },
                    "tone": {"type": "string", "description": "Tone: professional, technical, or conversational"},
                },
                "required": ["candidate_name", "role", "company", "matched_skills"],
            },
        annotations=ToolAnnotations(
                readOnlyHint=True,
                destructiveHint=False,
                idempotentHint=True,
                openWorldHint=False,
            ),
        ),
        Tool(
            name="github_proofer",
            description=(
                "Inspect a candidate's public GitHub profile and repositories. "
                "Cross-references technical resume claims with verifiable production code commits."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "candidate_github_or_resume": {
                        "type": "string",
                        "description": "GitHub profile URL, username handle, or resume text containing GitHub link",
                    },
                    "technical_claims": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Optional list of technical skills or claims to verify against code repos",
                    },
                },
                "required": ["candidate_github_or_resume"],
            },
            annotations=ToolAnnotations(
                readOnlyHint=True,
                destructiveHint=False,
                idempotentHint=True,
                openWorldHint=True,
            ),
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
        elif name == "source_filter":
            result = await source_filter(
                sources=arguments["sources"],
                company_domain=arguments.get("company_domain", ""),
            )
        elif name == "cover_letter_generator":
            result = await cover_letter_generator(
                candidate_name=arguments["candidate_name"],
                role=arguments["role"],
                company=arguments["company"],
                matched_skills=arguments["matched_skills"],
                approved_company_facts=arguments.get("approved_company_facts"),
                tone=arguments.get("tone", "professional"),
            )
        elif name == "github_proofer":
            result = await github_proofer(
                candidate_github_or_resume=arguments["candidate_github_or_resume"],
                technical_claims=arguments.get("technical_claims"),
            )
        else:
            logger.warning(f"Rejected invocation for unregistered tool: {name}")
            result = {
                "error": {
                    "code": "UNKNOWN_TOOL",
                    "message": f"Tool '{name}' is not registered on this MCP server.",
                    "registered_tools": [
                        "company_research", "evidence_validator", "jd_analyzer",
                        "ats_readiness", "source_filter", "cover_letter_generator", "github_proofer"
                    ],
                }
            }
            return [TextContent(type="text", text=json.dumps(result, indent=2))]
        
        return [TextContent(type="text", text=json.dumps(result, indent=2))]
    
    except KeyError as e:
        logger.error(f"Missing required parameter for tool '{name}': {e}", exc_info=True)
        sanitized_error = {
            "error": {
                "code": "INVALID_PARAMS",
                "message": f"Missing required parameter: {str(e)}",
                "tool": name,
            }
        }
        return [TextContent(type="text", text=json.dumps(sanitized_error, indent=2))]
    except Exception as e:
        logger.error(f"Internal execution failure in tool '{name}': {e}", exc_info=True)
        sanitized_error = {
            "error": {
                "code": "INTERNAL_TOOL_ERROR",
                "message": "Tool execution encountered an internal error. Please check server logs for details.",
                "tool": name,
                "error_type": type(e).__name__,
            }
        }
        return [TextContent(type="text", text=json.dumps(sanitized_error, indent=2))]


async def main():
    """Start MCP server with stdio transport (or parse CLI for transport)."""
    parser = argparse.ArgumentParser(description="CoverCraft MCP Server")
    parser.add_argument("--transport", choices=["stdio", "sse"], default="stdio", help="Transport mode")
    parser.add_argument("--port", type=int, default=8000, help="Port for SSE transport")
    args, _ = parser.parse_known_args()

    if args.transport == "sse":
        logger.info(f"Starting MCP server on SSE transport on port {args.port}...")
        try:
            from mcp.server.sse import SseServerTransport
            from starlette.applications import Starlette
            from starlette.routing import Route
            import uvicorn

            sse = SseServerTransport("/messages")

            async def handle_sse(request):
                async with sse.connect_sse(request.scope, request.receive, request._send) as streams:
                    await server.run(streams[0], streams[1], server.create_initialization_options())

            app = Starlette(routes=[
                Route("/sse", endpoint=handle_sse),
                Route("/messages", endpoint=sse.handle_post_message, methods=["POST"])
            ])
            uvicorn.run(app, host="0.0.0.0", port=args.port)
            return
        except ImportError:
            logger.warning("Starlette/uvicorn not installed; falling back to standard stdio transport.")

    logger.info("Starting CoverCraft MCP Server on stdio transport (7 Registered Tools)...")
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options()
        )


if __name__ == "__main__":
    asyncio.run(main())
