(function () {
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var revealTargets = document.querySelectorAll(".reveal-3d, .tilt-3d");
  if (revealTargets.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealTargets.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.25 }
      );
      revealTargets.forEach(function (el) {
        observer.observe(el);
      });
    }
  }

  var canvas = document.getElementById("hero-3d-canvas");
  if (!canvas || typeof THREE === "undefined") return;

  var hero = canvas.closest(".hero");
  var narrowViewport = window.matchMedia("(max-width: 600px)").matches;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / (canvas.clientHeight || 1), 0.1, 100);
  camera.position.set(0, 0, 6);

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, narrowViewport ? 1.5 : 2));

  function resize() {
    var w = canvas.clientWidth;
    var h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  var outerGeometry = new THREE.IcosahedronGeometry(1.8, 0);
  var outerMaterial = new THREE.MeshBasicMaterial({
    color: 0xc9a24b,
    wireframe: true,
    transparent: true,
    opacity: 0.55,
  });
  var outerGem = new THREE.Mesh(outerGeometry, outerMaterial);
  scene.add(outerGem);

  var innerGeometry = new THREE.IcosahedronGeometry(1.15, 0);
  var innerMaterial = new THREE.MeshBasicMaterial({
    color: 0xe3c98a,
    wireframe: true,
    transparent: true,
    opacity: 0.3,
  });
  var innerGem = new THREE.Mesh(innerGeometry, innerMaterial);
  scene.add(innerGem);

  resize();
  window.addEventListener("resize", resize);

  var scrollFraction = 0;
  function updateScrollFraction() {
    if (!hero) return;
    var rect = hero.getBoundingClientRect();
    var heroHeight = hero.offsetHeight || 1;
    var raw = -rect.top / heroHeight;
    scrollFraction = Math.min(Math.max(raw, 0), 1.4);
  }
  updateScrollFraction();
  window.addEventListener("scroll", updateScrollFraction, { passive: true });

  var clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();
    var spinSpeed = reduceMotion ? 0.03 : 0.15;
    var autoSpin = t * spinSpeed;

    outerGem.rotation.x = autoSpin * 0.6 + scrollFraction * 1.6;
    outerGem.rotation.y = autoSpin + scrollFraction * 2.4;
    outerGem.position.y = scrollFraction * -1.2;

    innerGem.rotation.x = -autoSpin * 0.4 - scrollFraction * 1.2;
    innerGem.rotation.y = -autoSpin * 0.8 - scrollFraction * 1.8;
    innerGem.position.y = scrollFraction * -1.2;

    renderer.render(scene, camera);
  }
  animate();
})();
