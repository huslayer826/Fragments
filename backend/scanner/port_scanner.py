"""Nmap port and service scanning."""

import logging
from typing import Any

import nmap

logger = logging.getLogger(__name__)


async def scan_ports(ip: str) -> dict[str, Any]:
    """Scan top 100 ports on a host, return open ports and OS guess.

    Returns:
        {
            "ports": {port_number: service_name, ...},
            "os": "OS guess string"
        }
    """
    scanner = nmap.PortScanner()
    try:
        logger.info("Port scanning %s", ip)
        scanner.scan(ip, arguments="-sV -T4 --top-ports 100")

        ports: dict[int, str] = {}
        os_guess = ""

        if ip in scanner.all_hosts():
            host = scanner[ip]

            # Extract open ports
            for proto in host.all_protocols():
                for port in host[proto]:
                    state = host[proto][port]
                    if state.get("state") == "open":
                        service = state.get("name", "unknown")
                        ports[port] = service

            # OS detection if available
            if "osmatch" in host and host["osmatch"]:
                os_guess = host["osmatch"][0].get("name", "")

        return {"ports": ports, "os": os_guess}

    except Exception as e:
        logger.error("Port scan failed for %s: %s", ip, e)
        return {"ports": {}, "os": ""}
