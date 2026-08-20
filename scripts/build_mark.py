"""
MyApproved mark. Geometry locked to the tuned position; do not move.

Two humanising moves are baked in and are the only departures from a
straight parametric build:
  1. CHAMFER  - tooth tips are cut flat at an angle instead of taking a
                uniform corner radius. Reads machined rather than default.
  2. BREATHING KNOCKOUT - the gap around the tick tightens at the elbow and
                widens where the arms exit, the way it would be cut by eye.

Output is one mask-free path on currentColor: prints, converts to CMYK PDF
in Inkscape, and gives mono / knockout for free via CSS colour.
"""
import math
from shapely.geometry import Point, Polygon, LineString
from shapely.ops import unary_union
from shapely.affinity import rotate, translate

QS = 64
VB = 512

# ---- LOCKED POSITION ----------------------------------------------------
CX, CY      = 236.0, 268.0
RING_OUTER  = 152.0
RING_INNER  = 118.0
N_TEETH     = 8
TOOTH_W     = 60.0
TOOTH_ROOT  = 140.0
TOOTH_TIP   = 198.0
PHASE       = 0.5
TICK_W      = 56.0

def polar(r, deg):
    a = math.radians(deg)
    return (CX + r * math.sin(a), CY - r * math.cos(a))

TICK = [polar(176, 315), (228.0, 288.0), polar(318, 45)]

# ---- HUMANISING ---------------------------------------------------------
CHAMFER  = 13.0   # flat cut on tooth tip corners; 0 gives square tips
GAP_ELBOW = 11.0  # knockout at the elbow (tight)
GAP_END   = 18.0  # knockout at the arm ends (open)


def channel():
    ln = LineString(TICK)
    L = ln.length
    e_t = ln.project(Point(TICK[1])) / L
    blobs = []
    for i in range(401):
        t = i / 400.0
        pt = ln.interpolate(t * L)
        e = min(abs(t - e_t) * 2.6, 1.0)
        g = GAP_ELBOW + (GAP_END - GAP_ELBOW) * e
        blobs.append(Point(pt.x, pt.y).buffer(TICK_W / 2 + g, quad_segs=24))
    return unary_union(blobs)


def cog():
    ring = Point(CX, CY).buffer(RING_OUTER, quad_segs=QS).difference(
        Point(CX, CY).buffer(RING_INNER, quad_segs=QS))
    parts, h, c = [ring], TOOTH_W / 2, CHAMFER
    for i in range(N_TEETH):
        a = PHASE + i * (360.0 / N_TEETH)
        p = Polygon([(-h, -TOOTH_ROOT), (-h, -TOOTH_TIP + c), (-h + c, -TOOTH_TIP),
                     (h - c, -TOOTH_TIP), (h, -TOOTH_TIP + c), (h, -TOOTH_ROOT)])
        parts.append(translate(rotate(p, a, origin=(0, 0)), CX, CY))
    return unary_union(parts)


def to_path(geom, prec=2):
    polys = [geom] if geom.geom_type == "Polygon" else list(geom.geoms)
    d = []
    for p in polys:
        for ring in [p.exterior, *p.interiors]:
            cs = list(ring.coords)[:-1]
            d.append("M " + " L ".join(f"{x:.{prec}f} {y:.{prec}f}" for x, y in cs) + " Z")
    return " ".join(d)


def wrap(d):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {VB} {VB}"\n'
            f'     fill="currentColor" role="img" aria-label="MyApproved">\n'
            f'  <path fill-rule="evenodd" d="{d}"/>\n</svg>\n')


def primary():
    solid = LineString(TICK).buffer(TICK_W / 2, cap_style=1, join_style=1, quad_segs=QS)
    return wrap(to_path(unary_union([cog().difference(channel()), solid]).simplify(0.35)))


def tick_only():
    pts = [(96.0, 250.0), (206.0, 348.0), (416.0, 108.0)]
    return wrap(to_path(LineString(pts).buffer(38.0, cap_style=1, join_style=1, quad_segs=QS)))


if __name__ == "__main__":
    open("myapproved-mark.svg", "w").write(primary())
    open("myapproved-mark-16.svg", "w").write(tick_only())
    print("written")
