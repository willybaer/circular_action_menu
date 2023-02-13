class CircularActionMenu {
  canvas;

  element;

  pointerElement;

  icons = [];

  images = [];

  iconsSize = 30;

  startAngle = 50;

  endAngle = 250;

  innerRadius = 25;

  outerRadius = 80;

  strokeSize = 1;

  fillColor = '#ffffff';

  fillColorSelected = '#bdbdbd';

  strokeColor = '#c9b8b8';

  clickListener;

  documentClickListener;

  pointerClickListener;

  pointerMoveListener;

  isOpen = false;

  isOpening = false;

  isClosing = false;

  metadata = {};

  constructor(icons, iconsSize, canvas) {
    this.icons = icons;
    this.iconsSize = iconsSize;
    this.canvas = canvas;
    this.pointerElement = document.createElement('div');
    this.pointerElement.style.display = 'none';
    this._calculateImageProperties();
  }

  withTargetElement(element) {
    this.element = element;
    element.parentNode.insertBefore(this.pointerElement, element);
    return this;
  }

  withStartAngle(startAngle) {
    if (startAngle > this.endAngle || startAngle < 0 || startAngle > 360) {
      throw 'Please submit a start angle which is lower than the end angle and is between 0 and 360 degrees.';
    }
    this.startAngle = startAngle;
    return this;
  }

  withEndAngle(endAngle) {
    if (endAngle < this.startAngle || endAngle < 0 || endAngle > 360) {
      throw 'Please submit an end angle which is higher than the start angle and is between 0 and 360 degrees.';
    }
    this.endAngle = endAngle;
    return this;
  }

  withInnerRadius(innerRadius) {
    if (innerRadius > this.outerRadius || innerRadius < 0) {
      throw 'Please submit an inner radius which is lower than the outer radius and bigger than 0.';
    }
    this.innerRadius = innerRadius;
    return this;
  }

  withOuterRadius(outerRadius) {
    if (outerRadius < this.innerRadius || outerRadius < 0) {
      throw 'Please submit an outer radius which is higher than the inner radius and bigger than 0.';
    }
    this.outerRadius = outerRadius;
    return this;
  }

  withClickListener(clickListener) {
    this.clickListener = clickListener;
    return this;
  }

  withMetaData(metadata) {
    this.metadata = metadata;
    return this;
  }

  _calculateImageProperties() {
    this.images = new Array(this.icons);

    const radiusBlockSize =
      (this.endAngle - this.startAngle) / this.icons.length;
    this.icons.forEach((icon, index) => {
      const img = new Image();
      img.onload = () => {
        let newHeight = 0;
        let newWidth = 0;
        if (img.width > img.height) {
          const ratio = img.height / img.width;
          newHeight = ratio * this.iconsSize;
          newWidth = this.iconsSize;
        } else {
          const ratio = img.width / img.height;
          newWidth = ratio * this.iconsSize;
          newHeight = this.iconsSize;
        }

        // Calculate diameter and radius of the image
        const diameter = Math.sqrt(newWidth * newWidth + newHeight * newHeight);
        const radius = diameter / 2;

        // Calculate image angles
        const startAngle = this.startAngle + index * radiusBlockSize;
        const endAngle = startAngle + radiusBlockSize;
        const centerAngle = startAngle + radiusBlockSize / 2;

        // Calculate image positions
        const radiusRest = this.outerRadius - this.innerRadius - diameter;
        const radiusTillImageCenter =
          this.innerRadius + radiusRest / 2 + radius;

        let xPos =
          Math.cos(this._degreeToRadians(centerAngle)) * radiusTillImageCenter; // Ankathete
        let yPos =
          Math.sin(this._degreeToRadians(centerAngle)) * radiusTillImageCenter; // Gegenkathete
        xPos -= newWidth / 2; // ctx. draw for an image starts always on the left top corner -> thats why we have to center the image
        yPos -= newHeight / 2;

        const image = {
          svg: img,
          color: icon.color,
          width: newWidth,
          height: newHeight,
          diameter,
          radius,
          startAngle,
          endAngle,
          centerAngle,
          radiusTillImageCenter,
          xPos,
          yPos,
          selected: false,
        };
        this.images[index] = image;
      };
      img.src = icon.src;
    });

    return this;
  }

  _degreeToRadians(angle) {
    return (Math.PI / 180) * angle;
  }

  _radianToDegrees(radian) {
    const degrees = (180 / Math.PI) * radian;
    if (degrees < 0) {
      return degrees + 360;
    }
    return degrees;
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
    return this;
  }

  open() {
    if (!this.isOpen && !this.isOpening) {
      this.isOpening = true;
      this.pointerElement.style.display = '';
      this._animateDrawing(this.innerRadius, 10);
      this._addEventListeners();
    }
    return this;
  }

  close() {
    if (this.isOpen && !this.isClosing) {
      this.isClosing = true;
      this.pointerElement.style.display = 'none';
      this._animateDrawing(this.outerRadius, -10);
      this._removeEventListeners();
    }
    return this;
  }

  _animateDrawing(radius, radiusIncrementor) {
    window.requestAnimationFrame(() => {
      this._draw(radius);
      const newRadius = radius + radiusIncrementor;
      if (radiusIncrementor > 0) {
        if (
          newRadius <= this.outerRadius ||
          (radius < this.outerRadius && newRadius > this.outerRadius)
        ) {
          this._animateDrawing(
            newRadius > this.outerRadius ? this.outerRadius : newRadius,
            radiusIncrementor
          );
        } else {
          this.isOpening = false;
          this.isOpen = true;
        }
      }
      if (radiusIncrementor < 0) {
        if (
          newRadius >= this.innerRadius ||
          (radius > this.innerRadius && newRadius < this.innerRadius)
        ) {
          this._animateDrawing(
            newRadius < this.innerRadius ? this.innerRadius : newRadius,
            radiusIncrementor
          );
        } else {
          // clear canvas
          this._clear();
          this.isClosing = false;
          this.isOpen = false;
        }
      }
    });
  }

  _clear() {
    const context = this.canvas.getContext('2d');
    context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  _draw(currentOuterRadius) {
    // Get center of the canvas
    this.centerX = this.element.offsetLeft + this.element.offsetWidth / 2;
    this.centerY = this.element.offsetTop + this.element.offsetHeight / 2;

    // Positioning canvas
    this.canvas.style.position = 'absolute';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.left = `${
      this.centerX - (this.outerRadius + this.strokeSize)
    }px`;
    this.canvas.style.top = `${
      this.centerY - (this.outerRadius + this.strokeSize)
    }px`;
    this.pointerElement.style.position = 'absolute';
    this.pointerElement.style.left = this.canvas.style.left;
    this.pointerElement.style.top = this.canvas.style.top;

    // Updating canvas dimensions
    this.canvasWidth = (this.outerRadius + this.strokeSize) * 2;
    this.canvasHeight = this.canvasWidth;
    this.canvas.style.width = `${this.canvasWidth}px`;
    this.canvas.style.height = `${this.canvasHeight}px`;
    this.canvas.width = this.canvasWidth * 2; // Blur Fix: https://stackoverflow.com/questions/8696631/canvas-drawings-like-lines-are-blurry
    this.canvas.height = this.canvasHeight * 2;
    this.pointerElement.style.width = this.canvas.style.width;
    this.pointerElement.style.height = this.canvas.style.height;

    this.canvasCenterX = this.canvasWidth / 2.0;
    this.canvasCenterY = this.canvasHeight / 2.0;

    const ctx = this.canvas.getContext('2d');
    ctx.scale(2, 2);

    // First draw all Images because of the recoloring of the images
    if (currentOuterRadius >= this.outerRadius) {
      this.images.forEach((image) => {
        this._drawImage(ctx, image);
      });
      ctx.globalCompositeOperation = 'destination-over';
    }

    // Start drawing parts
    this.images.forEach((image) => {
      this._drawPart(ctx, currentOuterRadius, image);
    });
    ctx.globalCompositeOperation = 'source-over';

    // Draw Inner circle
    this._drawInnerCircle(ctx);
  }

  _drawPart(ctx, radius, image) {
    // Draw outer circle
    ctx.beginPath();
    ctx.arc(
      this.canvasCenterX,
      this.canvasCenterY,
      radius,
      this._degreeToRadians(image.startAngle),
      this._degreeToRadians(image.endAngle)
    );
    ctx.lineTo(this.canvasCenterX, this.canvasCenterY);
    ctx.closePath();
    ctx.lineWidth = this.strokeSize;
    ctx.strokeStyle = this.strokeColor;
    ctx.stroke();
    ctx.fillStyle = image.selected ? this.fillColorSelected : this.fillColor;
    ctx.fill();
  }

  _drawImage(ctx, image) {
    ctx.drawImage(
      image.svg,
      this.canvasCenterX + image.xPos,
      this.canvasCenterY + image.yPos,
      image.width,
      image.height
    );

    // set composite mode
    ctx.globalCompositeOperation = 'source-atop';

    // draw color
    ctx.fillStyle = image.color;
    ctx.fillRect(
      this.canvasCenterX + image.xPos,
      this.canvasCenterY + image.yPos,
      image.width,
      image.height
    );

    ctx.globalCompositeOperation = 'source-over';
  }

  _drawInnerCircle(ctx) {
    // Draw inner circle stroke
    ctx.beginPath();
    ctx.arc(
      this.canvasCenterX,
      this.canvasCenterY,
      this.innerRadius,
      this._degreeToRadians(this.startAngle),
      this._degreeToRadians(this.endAngle)
    );
    ctx.closePath();
    ctx.lineWidth = this.strokeSize;
    ctx.strokeStyle = this.strokeColor;
    ctx.stroke();

    ctx.globalCompositeOperation = 'destination-out';

    // Remove inner cricle content
    ctx.beginPath();
    ctx.arc(
      this.canvasCenterX,
      this.canvasCenterY,
      this.innerRadius - this.strokeSize / 2,
      0,
      360
    );
    ctx.closePath();
    ctx.fillStyle = this.fillColor;
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
  }

  _addEventListeners() {
    this.pointerMoveListener = (e) => {
      const x = e.offsetX;
      const y = e.offsetY;

      const xDiff = x - this.canvasCenterX;
      const yDiff = y - this.canvasCenterY;
      const angle = this._radianToDegrees(Math.atan2(yDiff, xDiff));

      let changeExisiting = false;
      let isSelected = false;
      for (let i = 0; i < this.images.length; i++) {
        const image = this.images[i];
        if (!this._isInsideRadius(x, y) && image.selected) {

          changeExisiting = true;
          image.selected = false;
        } else if (
          this._isInsideRadius(x, y) &&
          image.startAngle <= angle &&
          image.endAngle > angle &&
          !image.selected
        ) {

          changeExisiting = true;
          image.selected = true;
          isSelected = true;
        } else if (
          this._isInsideRadius(x, y) &&
          (image.startAngle > angle || image.endAngle < angle) &&
          image.selected
        ) {

          changeExisiting = true;
          image.selected = false;
        }
      }

      if (changeExisiting) {
        if (isSelected) {
          this.pointerElement.style.cursor = 'pointer';
        } else {
          this.pointerElement.style.cursor = 'auto';
        }
        // Just Redraw if there are changes
        this._draw(this.outerRadius);
      }
    };
    this.pointerElement.addEventListener(
      'pointermove',
      this.pointerMoveListener
    );

    this.pointerClickListener = (e) => {
      const x = e.offsetX;
      const y = e.offsetY;

      const xDiff = x - this.canvasCenterX;
      const yDiff = y - this.canvasCenterY;
      const angle = this._radianToDegrees(Math.atan2(yDiff, xDiff));

      let selectedImage;
      let selectedImageIndex;
      this.images.forEach((image, index) => {
        if (image.startAngle <= angle && image.endAngle > angle) {
          selectedImage = image;
          selectedImageIndex = index;
        }
      });

      if (this.clickListener && selectedImage) {
        this.clickListener(this.metadata, selectedImageIndex);
      }
      this.close();
    };
    this.pointerElement.addEventListener('click', this.pointerClickListener);

    this.documentClickListener = (event) => {
      let targetElement = event.target;
      do {
        if (
          targetElement === this.pointerElement ||
          targetElement === this.element
        ) {
          return;
        }
        // Take parent node
        targetElement = targetElement.parentNode;
      } while (targetElement);

      this.close();
    };
    document.addEventListener('click', this.documentClickListener);
    return this;
  }

  _removeEventListeners() {
    document.removeEventListener('click', this.documentClickListener);
    this.pointerElement.removeEventListener('click', this.pointerClickListener);
    this.pointerElement.removeEventListener(
      'pointermove',
      this.pointerMoveListener
    );
    this.pointerElement.style.cursor = 'auto';
  }

  _isInsideRadius(x, y) {
    const diffX = this.canvasCenterX - x;
    const diffY = this.canvasCenterY - y;
    const c = Math.sqrt(diffX * diffX + diffY * diffY);
    if (c > this.innerRadius && c < this.outerRadius) {
      return true;
    }
    return false;
  }
}