function locoScroll(){
    gsap.registerPlugin(ScrollTrigger);

// Using Locomotive Scroll from Locomotive https://github.com/locomotivemtl/locomotive-scroll

const locoScroll = new LocomotiveScroll({
  el: document.querySelector("#main"),
  smooth: true
});
// each time Locomotive Scroll updates, tell ScrollTrigger to update too (sync positioning)
locoScroll.on("scroll", ScrollTrigger.update);

// tell ScrollTrigger to use these proxy methods for the "#main" element since Locomotive Scroll is hijacking things
ScrollTrigger.scrollerProxy("#main", {
  scrollTop(value) {
    return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
  }, // we don't have to define a scrollLeft because we're only scrolling vertically.
  getBoundingClientRect() {
    return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
  },
  // LocomotiveScroll handles things completely differently on mobile devices - it doesn't even transform the container at all! So to get the correct behavior and avoid jitters, we should pin things with position: fixed on mobile. We sense it by checking to see if there's a transform applied to the container (the LocomotiveScroll-controlled element).
  pinType: document.querySelector("#main").style.transform ? "transform" : "fixed"
});

// each time the window updates, we should refresh ScrollTrigger and then update LocomotiveScroll. 
ScrollTrigger.addEventListener("refresh", () => locoScroll.update());

// after everything is set up, refresh() ScrollTrigger and update LocomotiveScroll because padding may have been added for pinning, etc.
ScrollTrigger.refresh();
}
locoScroll()



// some changes to cursorEffect, so that the on click we can start playing
function cursorEffect() {
    var page1Content = document.querySelector("#page1-content");
    var cursor = document.querySelector("#cursor");
    var sidebar = document.querySelector(".sidebar");
    var menuToggle = document.querySelector("#check"); // The menu toggle (checkbox)

    // Move the cursor when mouse moves
    page1Content.addEventListener("mousemove", function(dets) {
        var cursorWidth = cursor.offsetWidth;
        var cursorHeight = cursor.offsetHeight;

        // Adjust to center the cursor on the mouse pointer
        gsap.to(cursor, {
            x: dets.x - cursorWidth / 2,  // Center the cursor horizontally
            y: dets.y - cursorHeight / 2  // Center the cursor vertically
        });
    });

    // Show cursor when mouse enters the content area
    page1Content.addEventListener("mouseenter", function() {
        gsap.to(cursor, {
            scale: 1,
            opacity: 1
        });
    });

    // Hide cursor when mouse leaves the content area
    page1Content.addEventListener("mouseleave", function() {
        gsap.to(cursor, {
            scale: 0,
            opacity: 0
        });
    });

    // Disable cursor clicks inside the sidebar
    sidebar.addEventListener("mouseenter", function() {
        cursor.style.pointerEvents = "none"; // Disable clickability of the cursor
    });

    sidebar.addEventListener("mouseleave", function() {
        cursor.style.pointerEvents = "auto"; // Enable clickability of the cursor when outside sidebar
    });

    // Disable cursor clicks when over the menu toggle area (checkbox)
    menuToggle.addEventListener("mouseenter", function() {
        cursor.style.pointerEvents = "none"; // Disable cursor clicks when over menu
    });

    menuToggle.addEventListener("mouseleave", function() {
        cursor.style.pointerEvents = "auto"; // Re-enable cursor clicks when not over menu
    });

    // Handle cursor click to open the link
    cursor.addEventListener("click", function(event) {
        // Get mouse position
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        const sidebarRect = sidebar.getBoundingClientRect(); // Get sidebar boundaries

        // Check if the cursor is inside the sidebar area
        const isInSidebar = 
            mouseX >= sidebarRect.left &&
            mouseX <= sidebarRect.right &&
            mouseY >= sidebarRect.top &&
            mouseY <= sidebarRect.bottom;

        // If cursor is NOT in the sidebar, open the link to "sudoku.html"
        if (!isInSidebar) {
            window.open("sudoku.html", "_blank"); // Open in a new tab
        }
    });
}

cursorEffect();


// swiperJS
function swiper(){
    var swiper = new Swiper(".mySwiper", {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        autoplay: {
            delay: 2500,
            disableOnInteraction: true,
          },
      });
}
swiper()

// loader- START
var loader = gsap.timeline()

loader.from("#loader h1",{
    x:50,
    opacity:0,
    duration:1,
    stagger:0.3
})

loader.to("#loader h1",{
    opacity:0,
    x:-40,
    duration:3,
    stagger:0.1
})

loader.to("#loader",{
    opacity:0
})

loader.from("#page1-content h1 span",{
    y:100,
    opacity:0,
    stagger:0.1,
    duration:0.4,
    delay:-0.5
})

loader.to("#loader",{
    display:"none"
})
// loader- END

// page-6 animation

const textContainer = document.getElementById("textContainer");
let easeFactor = 0.02;

let scene, camera, renderer, planeMesh;
let mousePosition = { x: 0.5, y: 0.5 };
let targetMousePosition = { x: 0.5, y: 0.5 };
let prevPosition = { x: 0.5, y: 0.5 };

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
    varying vec2 vUv;
    uniform sampler2D u_texture;
    uniform vec2 u_mouse;
    uniform vec2 u_prevMouse;

    void main() {
    vec2 gridUV = floor(vUv * vec2(40.0, 40.0)) / vec2(40.0, 40.0);
    vec2 centerOfPixel = gridUV + vec2(1.0/40.0, 1.0/40.0);

    vec2 mouseDirection = u_mouse - u_prevMouse;

    vec2 pixelToMouseDirection = centerOfPixel - u_mouse;
    float pixelDistanceToMouse = length(pixelToMouseDirection);
    float strength = smoothstep(0.3, 0.0, pixelDistanceToMouse);

    vec2 uvOffset = strength * -mouseDirection * 0.3;
    vec2 uv = vUv - uvOffset;

    vec4 color = texture2D(u_texture, uv);
    gl_FragColor = color;
    }
`;

function createTextTexture(text, size, color) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const canvasWidth = window.innerWidth * 2;
    const canvasHeight = window.innerHeight * 2;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Set the background color to black
    ctx.fillStyle = "#000000";  // Black background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const fontSize = size || Math.floor(canvasWidth * 2);

    // Set the text color to white smoke (#f5f5f5)
    ctx.fillStyle = "#f5f5f5";  
    ctx.font = `${fontSize}px sans-serif`;  // Default sans-serif font
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;

    const scalerFactor = Math.min(1, (canvasWidth * 1) / textWidth);
    const aspectCorrection = canvasWidth / canvasHeight;

    ctx.setTransform(
        scalerFactor,
        0,
        0,
        scalerFactor / aspectCorrection,
        canvasWidth / 2,
        canvasHeight / 2
    );

    ctx.strokeStyle = "#f5f5f5";  // Stroke color matching text color
    ctx.lineWidth = fontSize * 0.005;
    for (let i = 0; i < 3; i++) {
        ctx.strokeText(text, 0, 0);
    }

    ctx.fillText(text, 0, 0);

    return new THREE.CanvasTexture(canvas);
}

function initializeScene(texture) {
    scene = new THREE.Scene();

    const aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.OrthographicCamera(
        -1,
        1,
        1 / aspectRatio,
        -1 / aspectRatio,
        0.1,
        1000
    );
    camera.position.z = 1;

    let shaderUniforms = {
        u_mouse: { type: "v2", value: new THREE.Vector2() },
        u_prevMouse: { type: "v2", value: new THREE.Vector2() },
        u_texture: { type: "t", value: texture },
    };

    planeMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.ShaderMaterial({
            uniforms: shaderUniforms,
            vertexShader,
            fragmentShader,
        })
    );

    scene.add(planeMesh);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x000000, 1);  // Black background for the renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    textContainer.appendChild(renderer.domElement);
}

function reloadTexture() {
    const newTexture = createTextTexture(
        "ThankU",  // Replaced "zayno" with "ThankU"
        null,
        "#f5f5f5"  // White smoke text color
    );

    planeMesh.material.uniforms.u_texture.value = newTexture;
}

initializeScene(
    createTextTexture(
        "ThankU",  // Replaced "zayno" with "ThankU"
        null,
        "#f5f5f5"  // White smoke text color
    )
);

function animateScene() {
    requestAnimationFrame(animateScene);

    mousePosition.x += (targetMousePosition.x - mousePosition.x) * easeFactor;
    mousePosition.y += (targetMousePosition.y - mousePosition.y) * easeFactor;

    planeMesh.material.uniforms.u_mouse.value.set(
        mousePosition.x,
        1.0 - mousePosition.y
    );

    planeMesh.material.uniforms.u_prevMouse.value.set(
        prevPosition.x,
        1.0 - prevPosition.y
    );

    renderer.render(scene, camera);
}

animateScene();

textContainer.addEventListener("mousemove", handleMouseMove);
textContainer.addEventListener("mouseenter", handleMouseEnter);
textContainer.addEventListener("mouseleave", handleMouseLeave);

function handleMouseMove(event) {
    easeFactor = 0.04;
    let rect = textContainer.getBoundingClientRect();
    prevPosition = { ...targetMousePosition };

    targetMousePosition.x = (event.clientX - rect.left) / rect.width;
    targetMousePosition.y = (event.clientY - rect.top) / rect.height;
}

function handleMouseEnter(event) {
    easeFactor = 0.02;
    let react = textContainer.getBoundingClientRect();

    mousePosition.x = targetMousePosition.x = (event.clientX - rect.left) / rect.width;
    mousePosition.y = targetMousePosition.y = (event.clientY - rect.top) / rect.height;
}

function handleMouseLeave() {
    easeFactor = 0.02;
    targetMousePosition = { ...prevPosition };
}

window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
    const aspectRatio = window.innerWidth / window.innerHeight;
    camera.left = -1;
    camera.right = 1;
    camera.top = 1 / aspectRatio;
    camera.bottom = -1 / aspectRatio;

    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth.innerHeight);

    reloadTexture();
}
// page-6 animation