"""ARP scan using scapy to discover live hosts on a subnet."""

import logging
from typing import Any

logger = logging.getLogger(__name__)


async def arp_scan(subnet: str) -> list[tuple[str, str]]:
    """Perform ARP scan on subnet, return list of (IP, MAC) tuples.

    Requires root/sudo privileges for raw socket access.
    """
    try:
        from scapy.all import ARP, Ether, srp

        logger.info("Starting ARP scan on %s", subnet)
        arp_request = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(pdst=subnet)
        answered, _ = srp(arp_request, timeout=10, verbose=False)

        results: list[tuple[str, str]] = []
        for _, received in answered:
            ip: Any = received.psrc
            mac: Any = received.hwsrc
            results.append((str(ip), str(mac).upper()))

        logger.info("ARP scan found %d hosts", len(results))
        return results

    except PermissionError:
        logger.error("ARP scan requires root/sudo privileges")
        raise
    except Exception as e:
        logger.error("ARP scan failed: %s", e)
        raise
