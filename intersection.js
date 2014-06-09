function intersectionWith3DObjectAndPlane(object,plane) {
	scanPlane = {a: plane.geometry.vertices[0],
				b: plane.geometry.vertices[1],
				c: plane.geometry.vertices[2]};

	var newZ = plane.position.z;
	scanPlane.a.setZ(newZ); 
	scanPlane.b.setZ(newZ);
	scanPlane.c.setZ(newZ);

	// console.log(newZ);
	// console.log("new plane");
	// console.log(scanPlane.a.y);

	var lineGeo = new THREE.Geometry();

	// console.log(plane.geometry.vertices);
	object.geometry.faces.forEach(function(face) {
		// var face  = object.geometry.faces[2]; // 2 3 
		var a = object.geometry.vertices[face.a];
		var b = object.geometry.vertices[face.b];
		var c = object.geometry.vertices[face.c];

		var facePlane = {a: a, b: b, c: c};
		// console.log("facePlane");
		// console.log(facePlane);

		var result = segmentForIntersectPlaneWithPlane(facePlane,scanPlane);
		if (result) {
			if (!result.c) {
				lineGeo.vertices.push(result.a,result.b);
			} else {
				// console.log("Don't know what to do");
				// lineGeo.vertices.push(result.a,result.b);
				// lineGeo.vertices.push(result.b,result.c);
				// lineGeo.vertices.push(result.c,result.a);
			};
		};
	});

	return lineGeo;
}

function segmentForIntersectPlaneWithPlane(face, scanPlane) {

	var AB = {A: face.a, B:face.b};
	var BC = {A: face.b, B:face.c};
	var CA = {A: face.c, B:face.a};

	// console.log("find mid point for AB");
	var cAB = calcIntersectSegmentWithPlane(AB,scanPlane);
	// console.log("find mid point for BC");
	var cBC = calcIntersectSegmentWithPlane(BC,scanPlane);
	// console.log("find mid point for CA");
	var cCA = calcIntersectSegmentWithPlane(CA,scanPlane);

	var log = false;
	if (log) {
		// console.log("face intersect");
		if (cAB) {
			console.log(" mid points AB(" + cAB.x + " ; " + cAB.y + " ; " + cAB.z + ") ");
		};

		if (cBC) {
			console.log(" mid points BC(" + cBC.x + " ; " + cBC.y + " ; " + cBC.z + ") ");
		};

		if (cCA) {
			console.log(" mid points СA(" + cCA.x + " ; " + cCA.y + " ; " + cCA.z + ") ");
		};
	};

	if (cAB && cBC) {
		return {a: cAB, b: cBC};
	} else if (cBC && cCA) {
		return {a: cBC, b: cCA};
	} else if (cCA && cAB) {
		return {a: cCA, b: cAB};
	};

	return null;

	
}


function LineFacet(p1,p2,pa,pb,pc) { 
	var d;
	var a1,a2,a3;
	var total,denom,mu;
	var n,pa1,pa2,pa3;
	var p;

	/* Calculate the parameters for the plane */
	var nX = (pb.y - pa.y)*(pc.z - pa.z) - (pb.z - pa.z)*(pc.y - pa.y);
	var nY = (pb.z - pa.z)*(pc.x - pa.x) - (pb.x - pa.x)*(pc.z - pa.z);
	var nZ = (pb.x - pa.x)*(pc.y - pa.y) - (pb.y - pa.y)*(pc.x - pa.x);
	n = new THREE.Vector3(nX,nY,nZ);
	n.normalize(); 

	d = - n.x * pa.x - n.y * pa.y - n.z * pa.z;

	/* Calculate the position on the line that intersects the plane */
	denom = n.x * (p2.x - p1.x) + n.y * (p2.y - p1.y) + n.z * (p2.z - p1.z);
	if (Math.abs(denom) < Number.EPSILON)	/* Line and plane don't intersect */
		return false;

	mu = - (d + n.x * p1.x + n.y * p1.y + n.z * p1.z) / denom;
	var pX = p1.x + mu * (p2.x - p1.x);
	var pY = p1.y + mu * (p2.y - p1.y);
	var pZ = p1.z + mu * (p2.z - p1.z);

	p = new THREE.Vector3(pX,pY,pZ);

	if (mu < 0 || mu > 1)	/* Intersection not along line segment */
		return false;

	/* Determine whether or not the intersection point is bounded by pa,pb,pc */
	var pa1X = pa.x - p.x;
	var pa1Y = pa.y - p.y;
	var pa1Z = pa.z - p.z;
	pa1 = new THREE.Vector3(pa1X,pa1Y,pa1Z);
	pa1.normalize();

	var pa2X = pb.x - p.x;
	var pa2Y = pb.y - p.y;
	var pa2Z = pb.z - p.z;
	pa2 = new THREE.Vector3(pa2X,pa2Y,pa2Z);
	pa2.normalize();

	var pa3X = pc.x - p.x;
	var pa3Y = pc.y - p.y;
	var pa3Z = pc.z - p.z;
	pa3 = new THREE.Vector3(pa3X,pa3Y,pa3Z);
	pa3.normalize();

	a1 = pa1.x*pa2.x + pa1.y*pa2.y + pa1.z*pa2.z;
	a2 = pa2.x*pa3.x + pa2.y*pa3.y + pa2.z*pa3.z;
	a3 = pa3.x*pa1.x + pa3.y*pa1.y + pa3.z*pa1.z;
	var RTOD = 57.29577951308232; //180 / Math.PI;

	var totalRad = Math.acos(a1) + Math.acos(a2) + Math.acos(a3);
	var mult = 1e+16;
	var totalRad =  Math.round(totalRad * mult) / mult;
	// console.log("totalRad " + totalRad);
	// console.log("2Pi = " + Math.PI * 2);
	total = totalRad * RTOD;
	// console.log("total " + total);

	var EPS = 0.00000007;

	if (Math.abs(total - 360) > EPS)
		return false;

	return p;
}


function calcIntersectSegmentWithPlane (segment,plane) {
	var p1 = segment.A;
	var p2 = segment.B;
	// console.log("p1 ( " + p1.x + ";" + p1.y + ";" + p1.z);
	// console.log("p2 ( " + p2.x + ";" + p2.y + ";" + p2.z);
	var pA = plane.a;
	var pB = plane.b;
	var pC = plane.c;
	return LineFacet(p1,p2,pA,pB,pC);
}

function intersactionWithLayerAndLine(layer, line) {

	var count = layer.geometry.vertices.length;
	var points = [];
	for (var i = 0; i < count - 1; i += 2) {
		var p1 = layer.geometry.vertices[i];
		var p2 = layer.geometry.vertices[i + 1];
		var intersectPoint = intersection2Segments(p1,p2,line.A,line.B);
		if (intersectPoint) {
			points.push(intersectPoint);
		};
	}
	return points;
}


function intersection2Segments(start1,end1,start2,end2) {
	var dir1 = new THREE.Vector2(end1.x - start1.x,end1.y - start1.y);
	var dir2 = new THREE.Vector2(end2.x - start2.x,end2.y - start2.y);

	//считаем уравнения прямых проходящих через отрезки
	var a1 = -dir1.y;
	var b1 = +dir1.x;
	var d1 = -(a1*start1.x + b1*start1.y);

	var a2 = -dir2.y;
	var b2 = +dir2.x;
	var d2 = -(a2*start2.x + b2*start2.y);

	//подставляем концы отрезков, для выяснения в каких полуплоскотях они
	var seg1_line2_start = a2*start1.x + b2*start1.y + d2;
	var seg1_line2_end = a2*end1.x + b2*end1.y + d2;

	var seg2_line1_start = a1*start2.x + b1*start2.y + d1;
	var seg2_line1_end = a1*end2.x + b1*end2.y + d1;

	//если концы одного отрезка имеют один знак, значит он в одной полуплоскости и пересечения нет.
	if (seg1_line2_start * seg1_line2_end >= 0 || seg2_line1_start * seg2_line1_end >= 0) 
		return false;

	var u = seg1_line2_start / (seg1_line2_start - seg1_line2_end);
	dir1.multiplyScalar(u);
	var out_intersection = new THREE.Vector3(start1.x + dir1.x,start1.y + dir1.y,start1.z);

	return out_intersection;
}