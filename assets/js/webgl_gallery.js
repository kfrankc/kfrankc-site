let env = 'production'

if (env === 'production') {
    console.log = function () {};
}

// import the images from gallery file
import params from "@params"

// Class to generate a random masonry layout, using a square grid as base
class Grid {

    // The constructor receives all the following parameters:
    // - gridSize: The size (width and height) for smallest unit size
    // - gridColumns: Number of columns for the grid (width = gridColumns * gridSize)
    // - gridRows: Number of rows for the grid (height = gridRows * gridSize)
    // - gridMin: Min width and height limits for rectangles (in grid units)
    constructor(gridSize, gridColumns, gridRows, gridMin) {
        this.gridSize = gridSize
        this.gridColumns = gridColumns
        this.gridRows = gridRows
        this.gridMin = gridMin
        this.rects = []
        
        // Calculate number of squares needed to fill the entire space
        const squaresX = Math.ceil(this.gridColumns / this.gridMin)
        const squaresY = Math.ceil(this.gridRows / this.gridMin)
        
        // Initialize currentRects with squares of size gridMin
        this.currentRects = []
        for (let y = 0; y < squaresY; y++) {
            for (let x = 0; x < squaresX; x++) {
                this.currentRects.push({
                    x: x * this.gridMin,
                    y: y * this.gridMin,
                    w: this.gridMin,
                    h: this.gridMin
                })
            }
        }
    }

    // Takes the first rectangle on the list, and divides it in 2 more rectangles if possible
    splitCurrentRect () {
        if (this.currentRects.length) {
            const currentRect = this.currentRects.shift()
            const cutVertical = currentRect.w > currentRect.h
            const cutSide = cutVertical ? currentRect.w : currentRect.h
            const cutSize = cutVertical ? 'w' : 'h'
            const cutAxis = cutVertical ? 'x' : 'y'
            if (cutSide > this.gridMin * 2) {
                const rect1Size = randomInRange(this.gridMin, cutSide - this.gridMin)
                const rect1 = Object.assign({}, currentRect, { [cutSize]: rect1Size })
                const rect2 = Object.assign({}, currentRect, { [cutAxis]: currentRect[cutAxis] + rect1Size, [cutSize]: currentRect[cutSize] - rect1Size })
                this.currentRects.push(rect1, rect2)
            }
            else {
                this.rects.push(currentRect)
                this.splitCurrentRect()
            }
        }
    }
    
    // Call `splitCurrentRect` until there is no more rectangles on the list
    // Then return the list of rectangles
    generateRects () {
        while (this.currentRects.length) {
            this.splitCurrentRect()
        }
        return this.rects
    }
}

// Generate a random integer in the range provided
function randomInRange (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

// Get canvas view
const view = document.querySelector('.view')
// Loaded resources will be here
const resources = PIXI.Loader.shared.resources
// Target for pointer. If down, value is 1, else value is 0
let pointerDownTarget = 0
// Useful variables to keep track of the pointer
let pointerStart = new PIXI.Point()
let pointerDiffStart = new PIXI.Point()
let width, height, app, background, uniforms, diffX, diffY
let gridSize = 50
let gridMin = 10
let imagePadding = 50

let isMobileDevice = window.matchMedia("only screen and (max-width: 700px)").matches;
let isTabletDevice = window.matchMedia("only screen and (min-width: 701px) and (max-width: 1400px)").matches;

if(isMobileDevice){
    // Variables and settings for grid
    console.log("this is a mobile device")
    gridSize = 25
    gridMin = 10
    imagePadding = 25
}

if(isTabletDevice){
    // Variables and settings for grid
    console.log("this is a tablet")
    gridSize = 40
    gridMin = 10
    imagePadding = 35
}

let gridColumnsCount, gridRowsCount, gridColumns, gridRows, grid
let widthRest, heightRest, centerX, centerY
let rects, images, imagesUrls, container

let imagesUsed
let checker = arr => arr.every(v => v === true)


// Set dimensions
function initDimensions () {
    width = window.innerWidth
    height = window.innerHeight
    diffX = 0
    diffY = 0
}

// Set initial values for uniforms
function initUniforms () {
    uniforms = {
        uResolution: new PIXI.Point(width, height),
        uPointerDiff: new PIXI.Point(),
        uPointerDown: pointerDownTarget
    }
}

// Initialize the random grid layout
function initGrid () {
    // Getting columns
    gridColumnsCount = Math.ceil(width / gridSize)
    // Getting rows
    gridRowsCount = Math.ceil(height / gridSize)
    // Make the grid 5 times bigger than viewport
    gridColumns = gridColumnsCount * 3
    gridRows = gridRowsCount * 3
    // Create a new Grid instance with our settings
    grid = new Grid(gridSize, gridColumns, gridRows, gridMin)
    // Calculate the center position for the grid in the viewport
    widthRest = Math.ceil(gridColumnsCount * gridSize - width)
    heightRest = Math.ceil(gridRowsCount * gridSize - height)
    centerX = (gridColumns * gridSize / 2) - (gridColumnsCount * gridSize / 2)
    centerY = (gridRows * gridSize / 2) - (gridRowsCount * gridSize / 2)
    // Generate the list of rects
    rects = grid.generateRects()
    // For the list of images
    images = []
    // For storing the image URL and avoid duplicates
    imagesUrls = {}

    // For storing whether an image has been used:
    imagesUsed = [...Array(params.gallery.length)].map(() => {
        return false;
    });
}

// Init the PixiJS Application
function initApp () {
    // Create a PixiJS Application, using the view (canvas) provided
    app = new PIXI.Application({ view })
    // Resizes renderer view in CSS pixels to allow for resolutions other than 1
    app.renderer.autoDensity = true
    // Resize the view to match viewport dimensions
    app.renderer.resize(width, height)

    // Set the distortion filter for the entire stage
    const stageFragmentShader = resources['../shaders/stage_fragment.glsl'].data
    const stageFilter = new PIXI.Filter(undefined, stageFragmentShader, uniforms)
    app.stage.filters = [stageFilter]
}

// Init the gridded background
function initBackground () {
    // Create a new empty Sprite and define its size
    background = new PIXI.Sprite()
    background.width = width
    background.height = height
    // Get the code for the fragment shader
    const backgroundFragmentShader = resources['../shaders/background_fragment.glsl'].data
    // Create a new Filter using the fragment shader
    // We don't need a custom vertex shader, so we set it as `undefined`
    const backgroundFilter = new PIXI.Filter(undefined, backgroundFragmentShader, uniforms)
    // Assign the filter to the background Sprite
    background.filters = [backgroundFilter]
    // Add the background to the stage
    app.stage.addChild(background)
}

// Initialize a Container element for solid rectangles and images
function initContainer () {
    container = new PIXI.Container()
    app.stage.addChild(container)
}

// Helper function to set all values in an Array
function setAll(arr, val) {
    var i, n = arr.length;
    for (i = 0; i < n; ++i) {
        arr[i] = val;
    }
}

// Load texture for an image, giving its index
function loadTextureForImage (index) {
    // Get image Sprite
    const image = images[index]

    // Get the corresponding rect, to store more data needed (it is a normal Object)
    const rect = rects[index]
    // Create a new AbortController, to abort fetch if needed
    const { signal } = rect.controller = new AbortController()

    // Generate random number between 1 and params.gallery
    var idx = Math.floor(Math.random() * (params.gallery.length));
    // console.log("index: " + idx + " | file: " + params.gallery[idx].name)
    // Check if imagesUsed array is all filled, if yes, reset 
    if (checker(imagesUsed)) {
        console.log("resetting values")
        setAll(imagesUsed, false)
    }
    // Check if image is loaded already, if yes, load another image
    // Otherwise, set image index to true, and set texture
    if (imagesUsed[idx]) {
        loadTextureForImage(index)
    } else {
        let baseTexture, imageTexture

        imagesUsed[idx] = true

        baseTexture = new PIXI.BaseTexture.from(params.gallery[idx].name)

        function onTextureUpdate() {
            // this will log the correct width and height as the image has loaded
            console.log("name: " + params.gallery[idx].name + " | width:" + baseTexture.width + " | height: " + baseTexture.height)
            console.log("rect | width: " + image.width + " | height: " + image.height)
            
            // Calculate scaling factors for both dimensions
            const scaleX = image.width / baseTexture.width
            const scaleY = image.height / baseTexture.height
            
            // Use the smaller scale to ensure image fits within cell
            const scale = Math.min(scaleX, scaleY)
            
            // Calculate new dimensions maintaining aspect ratio
            const newWidth = baseTexture.width * scale
            const newHeight = baseTexture.height * scale
            
            // Center the image in the cell
            image.anchor.set(0.5)
            image.x += image.width / 2
            image.y += image.height / 2
            
            // Update image dimensions
            image.width = newWidth
            image.height = newHeight
            
            imageTexture = new PIXI.Texture(baseTexture)
            image.texture = imageTexture
            rect.loaded = true
        }

        if (baseTexture.valid) {
            console.log("valid!")
            onTextureUpdate()
        } else {
            console.log("not valid yet..")
            baseTexture.on("update", onTextureUpdate)
        }
    }
}

// Add solid rectangles and images
// So far, we will only add rectangles
function initRectsAndImages () {
    // Create a new Graphics element to draw solid rectangles
    const graphics = new PIXI.Graphics()
    // Select the color for rectangles
    graphics.beginFill(0xFFFFFF)
    // Loop over each rect in the list
    rects.forEach(rect => {
        // Create a new Sprite element for each image
        const image = new PIXI.Sprite()
        // Set image's position and size
        image.x = rect.x * gridSize
        image.y = rect.y * gridSize
        image.width = rect.w * gridSize - imagePadding
        image.height = rect.h * gridSize - imagePadding
        // Set it's alpha to 0, so it is not visible initially
        image.alpha = 0
        // Add image to the list
        images.push(image)
        // Draw the rectangle with red border
        // graphics.lineStyle(2, 0xFF0000) // Add 2px red border
        graphics.drawRect(image.x, image.y, image.width, image.height)
    })
    // Ends the fill action
    graphics.endFill()
    // Add the graphics (with all drawn rects) to the container
    container.addChild(graphics)
    // Add all image's Sprites to the container
    images.forEach(image => {
        container.addChild(image)
    })

    console.log("number of rects: " + rects.length)
}

// Check if rects intersects with the viewport
// and loads corresponding image
function checkRectsAndImages () {
    // Loop over rects
    rects.forEach((rect, index) => {
        // Get corresponding image
        const image = images[index]
        // Check if the rect intersects with the viewport
        if (rectIntersectsWithViewport(rect)) {
            // If rect just has been discovered
            // start loading image
            if (!rect.discovered) {
                rect.discovered = true
                loadTextureForImage(index)
            }
            // If image is loaded, increase alpha if possible
            if (rect.loaded && image.alpha < 1) {
                image.alpha += 0.02
            }
        } else { // The rect is not intersecting
            // If the rect was discovered before, but the
            // image is not loaded yet, abort the fetch
            if (rect.discovered && !rect.loaded) {
                rect.discovered = false
                rect.controller.abort()
            }
            // Decrease alpha if possible
            if (image.alpha > 0) {
                image.alpha -= 0.02
            }
        }
    })
}

// Check if a rect intersects the viewport
function rectIntersectsWithViewport (rect) {
    return (
        rect.x * gridSize + container.x <= width &&
        0 <= (rect.x + rect.w) * gridSize + container.x &&
        rect.y * gridSize + container.y <= height &&
        0 <= (rect.y + rect.h) * gridSize + container.y
    )
}

// Start listening events
function initEvents () {
    // Make stage interactive, so it can listen to events
    app.stage.interactive = true

    // Pointer & touch events are normalized into
    // the `pointer*` events for handling different events
    app.stage
    .on('pointerdown', onPointerDown)
    .on('pointerup', onPointerUp)
    .on('pointerupoutside', onPointerUp)
    .on('pointermove', onPointerMove)
}

    // On pointer down, save coordinates and set pointerDownTarget
function onPointerDown (e) {
    const { x, y } = e.data.global
    pointerDownTarget = 1
    pointerStart.set(x, y)
    pointerDiffStart = uniforms.uPointerDiff.clone()
}

// On pointer up, set pointerDownTarget
function onPointerUp () {
    pointerDownTarget = 0
}

// On pointer move, calculate coordinates diff
function onPointerMove (e) {
    const { x, y } = e.data.global
    if (pointerDownTarget) {
        diffX = pointerDiffStart.x + (x - pointerStart.x)
        diffY = pointerDiffStart.y + (y - pointerStart.y)
        diffX = diffX > 0 ? Math.min(diffX, centerX + imagePadding) : Math.max(diffX, -(centerX + widthRest))
        diffY = diffY > 0 ? Math.min(diffY, centerY + imagePadding) : Math.max(diffY, -(centerY + heightRest))
    }
}

// Init everything
function init () {
    initDimensions()
    initUniforms()
    initGrid()
    initApp()
    initBackground()
    initContainer()
    initRectsAndImages()
    initEvents()

    // Animation loop
    // Code here will be executed on every animation frame
    app.ticker.add(() => {
        // Multiply the values by a coefficient to get a smooth animation
        uniforms.uPointerDown += (pointerDownTarget - uniforms.uPointerDown) * 0.075
        uniforms.uPointerDiff.x += (diffX - uniforms.uPointerDiff.x) * 0.2
        uniforms.uPointerDiff.y += (diffY - uniforms.uPointerDiff.y) * 0.2
        // Set position for the container
        container.x = uniforms.uPointerDiff.x - centerX
        container.y = uniforms.uPointerDiff.y - centerY
        // Check rects and load/cancel images as needded
        checkRectsAndImages()
    })
}

// Clean the current Application
function clean () {
    // Stop the current animation
    app.ticker.stop()

    // Remove event listeners
    app.stage
    .off('pointerdown', onPointerDown)
    .off('pointerup', onPointerUp)
    .off('pointerupoutside', onPointerUp)
    .off('pointermove', onPointerMove)

    // Abort all fetch calls in progress
    rects.forEach(rect => {
    if (rect.discovered && !rect.loaded) {
        rect.controller.abort()
        }
    })
}

// On resize, reinit the app (clean and init)
// But first debounce the calls, so we don't call init too often
let resizeTimer
function onResize () {
    if (resizeTimer) clearTimeout(resizeTimer)
        resizeTimer = setTimeout(() => {
        clean()
        init()
    }, 200)
}
// Listen to resize event
window.addEventListener('resize', onResize)

// Load resources, then init the app
PIXI.Loader.shared.add([
    '../shaders/stage_fragment.glsl',
    '../shaders/background_fragment.glsl'
]).load(init)