class Item {
    constructor(x, y, inGameItem, quantity, parent, itemSpacing) {
        this.position = new p5.Vector(x, y);
        this.inGameItem = inGameItem;
        this.quantity = quantity;
        this.parent = parent;
        this.socialDistance = 100;
        this.children = 0;
        this.itemSpacing = 0;
        this.hoveredOver = false;

        if (parent != null) {
            this.itemSpacing = parent.itemSpacing + itemSpacing;
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
                let avgPosition = new p5.Vector();

                for (item of nearbyItems) {
                    avgPosition.add(item.position);

                    if (item.parent != null) {
                        let itemIntendedPosition = new p5.Vector();
                        itemIntendedPosition.x = item.position.x - (this.position.x - item.position.x) / 3;
                        itemIntendedPosition.y = item.position.y - (this.position.y - item.position.y) / 3;
                        item.position.x = lerp(item.position.x, itemIntendedPosition.x, 0.05);
                        item.position.y = lerp(item.position.y, itemIntendedPosition.y, 0.05);
                    }
                }
                avgPosition.div(nearbyItems.length);

                let intendedMovement = new p5.Vector();
                intendedMovement.x = avgPosition.x - this.position.x;
                intendedMovement.y = avgPosition.y - this.position.y;
                intendedMovement.setMag(max(this.socialDistance - dist(this.position.x, this.position.y, avgPosition.x, avgPosition.y), 5))

                let intendedPosition = new p5.Vector(this.position.x - intendedMovement.x, this.position.y - intendedMovement.y);
                this.position.x = lerp(this.position.x, intendedPosition.x + random(-0.05, 0.05), 0.15);
                this.position.y = lerp(this.position.y, intendedPosition.y + random(-0.05, 0.05), 0.15);
            }
        }
    }
}
