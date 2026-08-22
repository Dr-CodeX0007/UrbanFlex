// Run once: node backend/scripts/migrateProducts.js
// Moves the 24 existing hardcoded products (from assets/js/products.js) into MongoDB,
// under a default "Gym Equipment" category. Existing local image paths are preserved.
// Safe to re-run - it skips products that already exist (matched by slug).

require("dotenv").config({ path: require("path").join(__dirname, "..", "..", ".env") });
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Product = require("../models/Product");

const existingProducts = [
    { name: "Wall Mounted Pull-up Bar", slug: "wall-mounted-pullup-bar", price: 399, image: "wall-mounted-pullup-bar.png", rating: 4.9, reviews: 184, description: "Heavy-duty wall mounted pull-up bar designed for pull-ups, chin-ups and core workouts. Strong steel construction for long-lasting performance." },
    { name: "Barbell Combo Kit", slug: "barbell-combo-kit", price: 1099, image: "barbell-combo-kit.png", rating: 4.8, reviews: 226, description: "Complete barbell combo kit for home gym workouts, muscle building and strength training." },
    { name: "Dumbbell Set", slug: "dumbbell-set", price: 349, image: "dumbbell-set.png", rating: 4.9, reviews: 173, description: "Compact dumbbell set suitable for full-body workouts, fitness training and daily exercise." },
    { name: "ABS Combo Set", slug: "abs-combo-set", price: 299, image: "abs-combo-set.png", rating: 4.8, reviews: 148, description: "Complete abs workout combo for strengthening abdominal muscles and improving core stability." },
    { name: "ALL IN ONE MACHINE", slug: "all-in-one-machine", price: 2999, image: "all-in-one-machine.png", rating: 4.9, reviews: 312, description: "Multi-functional home gym machine designed to perform a wide range of strength training exercises." },
    { name: "Bench Press Combo", slug: "bench-press-combo", price: 649, image: "bench-press-combo.png", rating: 4.8, reviews: 201, description: "Bench press combo for chest, shoulder and upper body workouts with durable construction." },
    { name: "Dumbell Kit", slug: "dumbell-kit", price: 349, image: "dumbell-kit.png", rating: 4.8, reviews: 165, description: "Complete dumbbell kit designed for effective home workouts, muscle building and strength training." },
    { name: "Barbell Iron Set", slug: "barbell-iron-set", price: 789, image: "barbell-iron-set.png", rating: 4.9, reviews: 198, description: "Heavy-duty iron barbell set for progressive strength training and full-body workouts." },
    { name: "Adjustable Boxing Head", slug: "adjustable-boxing-head", price: 239, image: "adjustable-boxing-head.png", rating: 4.7, reviews: 122, description: "Adjustable boxing training head to improve speed, accuracy, reflexes and punching skills." },
    { name: "Complete Boxing Set", slug: "complete-boxing-set", price: 530, image: "complete-boxing-set.png", rating: 4.9, reviews: 214, description: "Complete boxing set for beginners and professionals, ideal for home and gym training." },
    { name: "Cricket Kit", slug: "cricket-kit", price: 449, image: "cricket-kit.png", rating: 4.8, reviews: 176, description: "Complete cricket kit suitable for practice sessions, coaching and recreational matches." },
    { name: "Elliptical Trainer", slug: "elliptical-trainer", price: 529, image: "elliptical-trainer.png", rating: 4.8, reviews: 263, description: "Compact elliptical trainer for low-impact cardio workouts and full-body fitness." },
    { name: "Exercise Bike", slug: "exercise-bike", price: 550, image: "exercise-bike.png", rating: 4.8, reviews: 241, description: "Compact exercise bike designed for effective indoor cardio workouts, endurance training and daily fitness." },
    { name: "ForeArm Combo", slug: "forearm-combo", price: 178, image: "forearm-combo.png", rating: 4.7, reviews: 138, description: "Forearm strengthening combo for improving grip strength, wrist stability and muscle endurance." },
    { name: "Hulk Forearm", slug: "hulk-forearm", price: 179, image: "hulk-forearm.png", rating: 4.8, reviews: 192, description: "Heavy-duty forearm exerciser built to develop stronger wrists, fingers and forearm muscles." },
    { name: "Adjustable Inclined Bench", slug: "adjustable-inclined-bench", price: 449, image: "adjustable-inclined-bench.png", rating: 4.9, reviews: 228, description: "Adjustable incline bench suitable for chest, shoulder, arm and full-body strength training." },
    { name: "Kettle Ball Combo", slug: "kettle-ball-combo", price: 312, image: "kettle-ball-combo.png", rating: 4.8, reviews: 156, description: "Kettle ball combo designed for functional fitness, strength, balance and endurance workouts." },
    { name: "Lat Pulldown Machine", slug: "lat-pulldown-machine", price: 600, image: "lat-pulldown-machine.png", rating: 4.9, reviews: 274, description: "Lat pulldown machine for building back, shoulder and arm strength with smooth and stable movement." },
    { name: "Motorised Treadmill", slug: "motorised-treadmill", price: 500, image: "motorised-treadmill.png", rating: 4.9, reviews: 318, description: "Motorised treadmill designed for walking, jogging and running with smooth performance for daily cardio workouts." },
    { name: "Pushup Pad Set", slug: "pushup-pad-set", price: 198, image: "pushup-pad-set.png", rating: 4.8, reviews: 169, description: "Pushup pad set that provides better grip, wrist support and comfort during upper body workouts." },
    { name: "Ten Dumbbell Set", slug: "ten-dumbbell-set", price: 449, image: "ten-dumbbell-set.png", rating: 4.9, reviews: 237, description: "Ten-piece dumbbell set ideal for progressive strength training and full-body fitness routines." },
    { name: "Tyre Flip Machine", slug: "tyre-flip-machine", price: 169, image: "tyre-flip-machine.png", rating: 4.8, reviews: 141, description: "Tyre flip training equipment built to improve explosive power, endurance and athletic performance." },
    { name: "Outfit Combo Set", slug: "outfit-combo-set", price: 359, image: "outfit-combo-set.png", rating: 4.7, reviews: 154, description: "Comfortable workout outfit combo set designed for gym training, fitness sessions and active lifestyles." },
    { name: "Zyro Ball", slug: "zyro-ball", price: 278, image: "zyro-ball.png", rating: 4.8, reviews: 203, description: "Gyroscopic Zyro Ball for improving wrist strength, grip power, endurance and forearm conditioning." }
];

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    let category = await Category.findOne({ slug: "gym-equipment" });
    if (!category) {
        category = await Category.create({ name: "Gym Equipment", slug: "gym-equipment" });
        console.log("Created default category: Gym Equipment");
    }

    let created = 0;
    let skipped = 0;

    for (const p of existingProducts) {
        const already = await Product.findOne({ slug: p.slug });
        if (already) {
            skipped++;
            continue;
        }

        await Product.create({
            name: p.name,
            slug: p.slug,
            category: category._id,
            images: [`assets/images/products/${p.image}`],
            mrp: p.price,
            discountPercent: 0,
            description: p.description,
            bulletPoints: [],
            rating: p.rating,
            reviews: p.reviews,
            deliveryDays: 5
        });
        created++;
    }

    console.log(`Migration done. Created: ${created}, Skipped (already existed): ${skipped}`);

    await mongoose.disconnect();
    process.exit(0);
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});