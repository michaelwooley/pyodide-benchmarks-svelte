export const PY_MAIN_STARTUP = `
import sys
from pyodide.console import PyodideConsole, BANNER, repr_shorten
import __main__
# pyconsole = PyodideConsole(__main__.__dict__)

# return value
# sys.version
{"banner": BANNER, "reprShorten": repr_shorten}
`;
