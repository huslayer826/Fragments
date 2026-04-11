"""MAC vendor resolution using the manuf library."""

import logging

logger = logging.getLogger(__name__)

_parser = None


def _get_parser():  # type: ignore[no-untyped-def]
    global _parser
    if _parser is None:
        try:
            import manuf
            _parser = manuf.MacParser()
        except Exception as e:
            logger.warning("Failed to initialize OUI parser: %s", e)
    return _parser


def lookup_vendor(mac: str) -> str:
    """Return vendor name for a MAC address, or empty string if unknown."""
    parser = _get_parser()
    if parser is None:
        return ""
    try:
        result = parser.get_manuf(mac)
        return str(result) if result else ""
    except Exception:
        return ""
