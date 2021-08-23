class Item {
    constructor(x, y, inGameItem, quantity, parent) {
        this.position = new p5.Vector(x, y);
        this.inGameItem = inGameItem;
        this.quantity = quantity;
        this.parent = parent;
        this.socialDistance = 100;
    }

    display() {
        if (dist(mouseX, mouseY, this.position.x, this.position.y) < this.socialDistance / 2) {
            fill(0, 255, 0, 50);
            if (mouseIsPressed) {
                this.position.x = mouseX;
                this.position.y = mouseY;
            }
        } else {
            fill(255, 0, 0, 50);
        }
        ellipse(this.position.x, this.position.y, this.socialDistance);
        image(this.inGameItem.sprite, this.position.x-(this.inGameItem.sprite.width / 2) + 1, this.position.y-(this.inGameItem.sprite.height / 2) + 1, this.inGameItem.sprite.width * 0.9, this.inGameItem.sprite.height * 0.9);
    }

    update(treeItems) {
        this.socialDistance = max(this.inGameItem.sprite.width, this.inGameItem.sprite.height) * 1.4 + 10;

        if (this.parent != null) {
            stroke(1);
            line(this.position.x, this.position.y, this.parent.position.x, this.parent.position.y);
            noStroke();

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

            // for (item of treeItems) {
            //     let distance = dist(this.position.x, this.position.y, item.position.x, item.position.y);
            //
            //     if (item != this && distance < (this.socialDistance / 2 + item.socialDistance / 2)) {
            //         fill(0,255,0,50);
            //         ellipse(this.position.x, this.position.y, this.socialDistance);
            //         fill(255,0,0,50);
            //     }
            // }
        }
    }
}
