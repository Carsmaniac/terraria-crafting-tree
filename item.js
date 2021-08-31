class Item {
    constructor(x, y, inGameItem, quantity, parent, itemSpacing) {
        // this.position = new p5.Vector(x, y);
        this.position = new p5.Vector();
        this.inGameItem = inGameItem;
        this.quantityNeeded = quantity;
        this.parent = parent;
        this.socialDistance = 100;
        this.children = 0;
        this.hoveredOver = false;

        if (this.parent != null) {
            this.itemSpacingIndex = parent.itemSpacingIndex + 1;
            this.itemSpacing = itemSpacing[this.itemSpacingIndex];
            if (this.parent.inGameItem.name.substring(0, 4) == "any-") {
                this.quantityNeeded = parent.quantityNeeded;
                this.quantityTotal = parent.quantityTotal;
            } else {
                this.quantityTotal = ceil(this.quantityNeeded * this.parent.quantityTotal / this.parent.inGameItem.quantityMade);
            }
        } else {
            this.itemSpacingIndex = -1;
            this.quantityTotal = 1;
            this.socialDistance = 0;
        }
    }

    display(mousePos) {
        if (dist(mousePos.x, mousePos.y, this.position.x, this.position.y) < max(this.socialDistance / 2, 25)) {
            this.hoveredOver = true;
        } else {
            this.hoveredOver = false;
        }
        if (this.parent != null) {
            fill(0);
            noStroke();

            let arrowStart = p5.Vector.sub(this.position, this.parent.position);
            arrowStart.setMag(-this.socialDistance / 2);
            arrowStart.add(this.position);
            let arrowEnd = p5.Vector.sub(this.parent.position, this.position);
            arrowEnd.setMag(-this.parent.socialDistance / 2 - 20);
            arrowEnd.add(this.parent.position);

            push();
            translate(arrowStart.x, arrowStart.y);
            rotate(p5.Vector.sub(arrowEnd, arrowStart).heading() - HALF_PI);
            // Lines are drawn on top of all other shapes, including the fade-out white overlay when hovering, so a rect is used instead
            rect(-0.75, 5, 1.5, dist(arrowStart.x, arrowStart.y, arrowEnd.x, arrowEnd.y) - 5);
            pop();
            push();
            translate(arrowEnd.x, arrowEnd.y);
            rotate(p5.Vector.sub(arrowEnd, arrowStart).heading() + HALF_PI);
            rotate(PI);
            triangle(-4, -5, 4, -5, 0, 10);
            pop();
        } else {
            if (!this.hoveredOver) {
                noStroke();
                fill(0, 255, 0, 50);
                fill(255);
                ellipse(this.position.x, this.position.y, this.socialDistance + 40);
            }
        }
        image(this.inGameItem.sprite, this.position.x-(this.inGameItem.sprite.width / 2) - 3, this.position.y-(this.inGameItem.sprite.height / 2) - 3, this.inGameItem.sprite.width * 1.1, this.inGameItem.sprite.height * 1.1);
    }

    displayHoverInformation(craftingStations) {
        push();
        translate(this.position.x, this.position.y);
        cursor("pointer");

        fill(255, 255, 255, 70);
        circle(0, 0, 30000);
        fill(255);
        textSize(25);
        let nameAndQuantity = this.inGameItem.displayName;
        if (this.quantityNeeded > 1) {
            nameAndQuantity = concat(nameAndQuantity, " x" + this.quantityNeeded);
        }
        if (this.quantityTotal > 1) {
            nameAndQuantity = concat(nameAndQuantity, " (x" + this.quantityTotal + " total)");
        }
        let rectWidth = max(160, textWidth(this.inGameItem.displayName) + 65);
        let rectHeight = 300;
        textSize(15);
        rectWidth = max(rectWidth, textWidth("(Click to open wiki page)") + 65);

        let craftingStation = null;
        for (let i = 0; i < craftingStations.length; i ++) {
            if (craftingStations[i].name == this.inGameItem.craftingStation) {
                craftingStation = craftingStations[i];
            }
        }

        if (craftingStation != null && this.inGameItem.acquisition != "") {
            if (craftingStation.name == "by-hand") {
                rectWidth = max(rectWidth, textWidth(this.inGameItem.acquisition) + 65);
                rectWidth = max(rectWidth, textWidth("Or crafted by hand") + 65);
                rectHeight = (this.inGameItem.sprite.height * 1.8 + 265);
            } else {
                rectWidth = max(rectWidth, textWidth(this.inGameItem.acquisition) + 65);
                rectWidth = max(rectWidth, textWidth("Or crafted at " + craftingStation.displayName) + 65);
                rectHeight = (this.inGameItem.sprite.height * 1.8 + craftingStation.sprite.height + 265);
            }
        } else if (craftingStation != null) {
            if (craftingStation.name == "by-hand") {
                rectWidth = max(rectWidth, textWidth("Crafted by hand") + 65);
                rectHeight = (this.inGameItem.sprite.height * 1.8 + 240);
            } else {
                rectWidth = max(rectWidth, textWidth("Crafted at " + craftingStation.displayName) + 65);
                rectHeight = (this.inGameItem.sprite.height * 1.8 + craftingStation.sprite.height + 240);
            }
        } else if (this.inGameItem.acquisition != "") {
            rectWidth = max(rectWidth, textWidth(this.inGameItem.acquisition) + 65);
            rectHeight = (this.inGameItem.sprite.height * 1.8 + 240);
        } else {
            rectHeight = (this.inGameItem.sprite.height * 1.8 + 132);
            cursor(ARROW);
        }

        let quantityText;
        let quantityOffset = 0;
        if (this.quantityNeeded > 1 && this.quantityTotal > this.quantityNeeded) {
            quantityText = "(x" + this.quantityNeeded + ", x" + this.quantityTotal + " total)";
            quantityOffset = 25;
        } else if (this.quantityNeeded > 1) {
            quantityText = "(x" + this.quantityNeeded + ")";
            quantityOffset = 25;
        } else if (this.quantityTotal > this.quantityNeeded) {
            quantityText = "(x" + this.quantityTotal + " total)";
            quantityOffset = 25;
        }
        rectHeight += quantityOffset;

        rect(-rectWidth / 2, -(this.inGameItem.sprite.height / 1.2) - 45, rectWidth, rectHeight);
        image(this.inGameItem.sprite, -(this.inGameItem.sprite.width / 1.1), -(this.inGameItem.sprite.height / 1.1),
              this.inGameItem.sprite.width * 1.8, this.inGameItem.sprite.height * 1.8)
        fill(0);
        textSize(25);
        text(this.inGameItem.displayName, 0, (this.inGameItem.sprite.height / 1.2) + 60);
        textSize(15);
        if (quantityOffset > 0) {
            text(quantityText, 0, (this.inGameItem.sprite.height / 1.2) + 90);
        }

        if (craftingStation != null && this.inGameItem.acquisition != "") {
            text(this.inGameItem.acquisition, 0, (this.inGameItem.sprite.height / 1.2) + quantityOffset + 105);
            if (craftingStation.name == "by-hand") {
                text("Or crafted by hand", 0, (this.inGameItem.sprite.height / 1.2) + quantityOffset + 135);
                text("(Click to open wiki page)", 0, (this.inGameItem.sprite.height / 1.2) + quantityOffset + 195)
            } else {
                text("Or crafted at " + craftingStation.displayName, 0, (this.inGameItem.sprite.height / 1.2) + quantityOffset + 135);
                image(craftingStation.sprite, -(craftingStation.sprite.width / 2), (this.inGameItem.sprite.height / 1.2) + quantityOffset + 150,
                      craftingStation.sprite.width, craftingStation.sprite.height);
                text("(Click to open wiki page)", 0, (this.inGameItem.sprite.height / 1.2) + craftingStation.sprite.height + quantityOffset + 195)
            }
        } else if (craftingStation != null) {
            if (craftingStation.name == "by-hand") {
                text("Crafted by hand", 0, (this.inGameItem.sprite.height / 1.2) + quantityOffset + 110);
                text("(Click to open wiki page)", 0, (this.inGameItem.sprite.height / 1.2) + quantityOffset + 170)
            } else {
                text("Crafted at " + craftingStation.displayName, 0, (this.inGameItem.sprite.height / 1.2) + quantityOffset + 110);
                image(craftingStation.sprite, -(craftingStation.sprite.width / 2), (this.inGameItem.sprite.height / 1.2) + quantityOffset + 125,
                      craftingStation.sprite.width, craftingStation.sprite.height);
                text("(Click to open wiki page)", 0, (this.inGameItem.sprite.height / 1.2) + craftingStation.sprite.height + quantityOffset + 170)
            }
        } else if (this.inGameItem.acquisition != "") {
            text(this.inGameItem.acquisition, 0, (this.inGameItem.sprite.height / 1.2) + quantityOffset + 110);
            text("(Click to open wiki page)", 0, (this.inGameItem.sprite.height / 1.2) + quantityOffset + 170)
        }
        pop();
    }

    update(treeItems) {
        this.socialDistance = max(this.inGameItem.sprite.width, this.inGameItem.sprite.height) * 1.6 + 10;

        if (this.parent != null) {
            let nearbyItems = [];
            for (item of treeItems) {
                let distance = dist(this.position.x, this.position.y, item.position.x, item.position.y)

                if (item != this && distance < (this.socialDistance / 2 + item.socialDistance / 2)) {
                    append(nearbyItems, item);
                }
            }
            if (nearbyItems.length > 0) {
                // fill(255, 0, 0);
                // ellipse(this.position.x, this.position.y, 50);
            }
        }
    }
}
