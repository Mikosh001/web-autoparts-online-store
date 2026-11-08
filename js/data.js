/* Shared catalog data. Keep IDs stable because cart and favorites store them. */
"use strict";
window.AutoParts = {
  products: [
    { id: "air", name: "Performance Air Filter", sku: "ENG-101", category: "engine", price: 45, image: "air-filter.png", rating: 5, description: "A replacement air filter for routine engine maintenance. Confirm dimensions before ordering." },
    { id: "rotor", name: "Front Brake Rotor", sku: "BRK-204", category: "brakes", price: 189, image: "brake-rotor.png", rating: 5, description: "A front brake rotor for your next brake service. Ask our team to confirm vehicle fitment." },
    { id: "shock", name: "Shock Absorber", sku: "SUS-310", category: "suspension", price: 245, image: "shock-absorber.png", rating: 5, description: "A replacement shock absorber. Check mounting points and vehicle specifications before ordering." },
    { id: "battery", name: "Car Battery", sku: "ELC-410", category: "electronics", price: 165, image: "battery.png", rating: 5, description: "An automotive replacement battery. Confirm capacity, dimensions and terminal position with our team." },
    { id: "tire", name: "Alloy Wheel & Tire", sku: "WHL-520", category: "wheels", price: 199, image: "tire.png", rating: 5, description: "A wheel and tire option for everyday driving. Check tire size, offset and bolt pattern." },
    { id: "mirror", name: "Side Mirror", sku: "BDY-615", category: "body", price: 89, image: "body-mirror.png", rating: 5, description: "A replacement exterior mirror. Confirm the side, connector and adjustment type before ordering." },
    { id: "muffler", name: "Stainless Steel Muffler", sku: "EXH-720", category: "exhaust", price: 229, image: "exhaust.png", rating: 5, description: "A stainless steel exhaust muffler. Ask about pipe diameter and mounting compatibility." }
  ],
  categories: [
    { id: "engine", name: "Engine Parts", image: "air-filter.png", description: "Air filters and other essential engine components." },
    { id: "brakes", name: "Brake Systems", image: "brake-rotor.png", description: "Brake rotors, pads, calipers, and stopping components." },
    { id: "wheels", name: "Wheels & Tires", image: "tire.png", description: "Tires and wheels for confident everyday driving." },
    { id: "suspension", name: "Suspension", image: "shock-absorber.png", description: "Shock absorbers and parts for a smoother ride." },
    { id: "electronics", name: "Electronics", image: "battery.png", description: "Batteries, sensors, and electrical components." },
    { id: "body", name: "Body & Exterior", image: "body-mirror.png", description: "Mirrors and exterior replacement parts." },
    { id: "exhaust", name: "Exhaust Systems", image: "exhaust.png", description: "Mufflers and exhaust system components." }
  ]
};
