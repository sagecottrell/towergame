from collections import defaultdict
from pathlib import Path
from watchfiles import watch, Change

DIR = Path(__file__).parent
ASSET_ROOT = DIR.absolute() / "assets"
ALLOWED_FILETYPES = {'.png', '.gif', '.bmp'}

def recdict():
    return defaultdict(recdict)

namespaces = recdict()
imports = {}

def recurse(current: dict, indent: int):
    t = '\t' * indent
    for key, value in current.items():
        if isinstance(value, dict):
            yield f"{t}export namespace {key} {{"
            yield from recurse(value, indent + 1)
            yield "}"
        else:
            yield f"{t}export const {value.rsplit('__')[-1].upper()} = {value};"


def get_varname_fname(f: Path):
    fname = f"./{str(f).replace("\\", "/")}"
    varname = fname.lower().replace('-', '_').replace('.', '_').replace("/", "__")
    return varname, fname


def add_item(f: Path, varname: str):
    if f.suffix not in ALLOWED_FILETYPES:
        return
    print(f'add: {f=}')
    current = namespaces
    for p in f.parts[:-1]:
        current = current[p]
    current[f.parts[-1]] = varname
    imports[varname] = fname

def delete_item(f: Path, varname: str):
    if f.suffix not in ALLOWED_FILETYPES:
        return
    print(f'delete: {f=}')
    current = namespaces
    for p in f.parts[:-1]:
        current = current[p]
    p = f.parts[-1]
    if p in current:
        current.pop(p)
    if varname in imports:
        imports.pop(varname)

def write():
    file_path = ASSET_ROOT.parent / 'images.ts'
    with file_path.open('w', newline='\n') as images_ts:
        for varname, fname in imports.items():
            images_ts.write(f"import {varname} from './{(ASSET_ROOT / fname).relative_to(DIR).as_posix()}';\n")

        lines = list(recurse(namespaces, 0))

        lines.append("const all = {")
        for key in namespaces:
            lines.append(f'\t{key},')
        lines.append('};')
        lines.append('export default all;')

        images_ts.write("\n".join(lines))
        images_ts.flush()


for f in ASSET_ROOT.glob("**/*"):
    f = f.relative_to(ASSET_ROOT)
    varname, fname = get_varname_fname(f)
    if varname:
        add_item(f, varname)

write()


import sys
if sys.argv[1] == '--watch':
    for changes in watch(ASSET_ROOT):
        for change, raw_path in changes:
            print(raw_path, 'added' if change == Change.added else '', 'deleted' if change == change.deleted else '')
            f = Path(raw_path).relative_to(ASSET_ROOT)
            if f.suffix not in ALLOWED_FILETYPES:
                continue

            varname, fname = get_varname_fname(f)
            match change:
                case Change.added:
                    add_item(f, varname)
                case Change.modified:
                    add_item(f, varname)
                case Change.deleted if not f.exists():
                    delete_item(f, varname)
        write()