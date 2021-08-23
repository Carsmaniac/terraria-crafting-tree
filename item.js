class Item {
    constructor(x, y, inGameItem) {
        this.position = new p5.Vector(x, y);
        this.inGameItem = inGameItem;
        this.socialDistance = 100;
    }

    display() {
        ellipse(this.position.x, this.position.y, this.socialDistance);
        image(this.inGameItem.sprite, this.position.x-(this.inGameItem.sprite.width/2), this.position.y-(this.inGameItem.sprite.height/2), this.inGameItem.sprite.width*0.9, this.inGameItem.sprite.height*0.9);
    }

    update(someItems) {
        let nearbyItems = [];
        for (item of someItems) {
            let distance = dist(this.position.x, this.position.y, item.position.x, item.position.y)

            if (item != this && distance < this.socialDistance) {
                append(nearbyItems, item);
            }
        }
        if (nearbyItems.length > 0) {
            let avgPosition = new p5.Vector();

            for (item of nearbyItems) {
                avgPosition.add(item.position);
            }
            avgPosition.div(nearbyItems.length);

            let intendedMovement = new p5.Vector();
            intendedMovement.x = avgPosition.x - this.position.x;
            intendedMovement.y = avgPosition.y - this.position.y;
            intendedMovement.setMag(this.socialDistance - dist(this.position.x, this.position.y, avgPosition.x, avgPosition.y))

            let intendedPosition = new p5.Vector(this.position.x - intendedMovement.x, this.position.y - intendedMovement.y);
            this.position.x = lerp(this.position.x, intendedPosition.x, 0.15);
            this.position.y = lerp(this.position.y, intendedPosition.y, 0.15);
        }
    }
}
