function intersectionWith3DObjectAndPlane(object,plane) {
	scanPlane = {a: plane.geometry.vertices[0],
				b: plane.geometry.vertices[1],
				c: plane.geometry.vertices[2]};

	var newY = plane.position.y;
	scanPlane.a.setY(newY); 
	scanPlane.b.setY(newY);
	scanPlane.c.setY(newY);

	// console.log(newY);
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
	


	// var isValidAB = isValidVertex(cAB);
	// var isValidBC = isValidVertex(cBC);
	// var isValidCA = isValidVertex(cCA);

	// if (!isValidAB && !isValidBC && !isValidCA) {
	// 	// console.log("face don't intersect");
	// 	return null;
	// } else if (isValidAB && isValidBC && isValidCA) {
	// 	// console.log("face intersect fully");
	// 	return {a: cAB, b: cBC, c:cCA};
	// } else {
	// 	if (isValidAB && isValidBC) {
	// 		return {a: cAB, b: cBC};
	// 	} else if (isValidBC && isValidCA) {
	// 		return {a: cBC, b: cCA};
	// 	} else {
	// 		return {a: cCA, b: cAB};
	// 	};
	// };

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
	// console.log("return 3");
	// console.log("return p");
	// console.log(p);
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

/*
	var Axr = segment.A.x; var Ayr = segment.A.y; var Azr = segment.A.z;
	var Bxr = segment.B.x; var Byr = segment.B.y; var Bzr = segment.B.z;

	var Cxr = plane.a.x; var Cyr = plane.a.y; var Czr = plane.a.z;
	var Dxr = plane.b.x; var Dyr = plane.b.y; var Dzr = plane.b.z;
	var Exr = plane.c.x; var Eyr = plane.c.y; var Ezr = plane.c.z;

	var x11=Axr; var y11=Ayr; var z11=Azr;
	var x12=Bxr; var y12=Byr; var z12=Bzr;

	var x1=Cxr; var y1=Cyr; var z1=Czr;
	var x2=Dxr; var y2=Dyr;	var z2=Dzr;
	var x3=Exr; var y3=Eyr;	var z3=Ezr;

	var s101=(y2-y1)*(z3-z1)-(z2-z1)*(y3-y1); //  ' A 
	var s102=(z2-z1)*(x3-x1)-(x2-x1)*(z3-z1);  // ' B 
	var s103=(x2-x1)*(y3-y1)-(y2-y1)*(x3-x1); //  ' C 
	var s104=-(s101*x1+s102*y1+s103*z1);      //  ' D 
	var s105=s101*(x12-x11)+s102*(y12-y11)+s103*(z12-z11); 
	var s=(-s104-s101*x11-s102*y11-s103*z11)/s105; 
	var x = x11*1+(x12-x11)*s; 
	var y = y11*1+(y12-y11)*s; 
	var z = z11*1+(z12-z11)*s; 

	var mult = 1e+8;
	var nx = x;// Math.round(x * mult) / mult;
	var ny = y;// Math.round(y * mult) / mult;
	var nz = z;// Math.round(z * mult) / mult;

	var point = new THREE.Vector3(nx,ny,nz);
	return point;
	*/
}

function isValidVertex(vertex) {
	if ((Math.abs(vertex.x) == Infinity) || 
		(Math.abs(vertex.y) == Infinity) || 
		(Math.abs(vertex.z) == Infinity)) {
		return false;
	};
	return true;
}