import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 1,
  iterations: 100,
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:4000/api/orders";

const headers = {
  "Content-Type": "application/json",
};

export default function () {
  // ── LIST (GET /api/orders) ──────────────────────────────────────────
  let res = http.get(BASE_URL);
  check(res, {
    "GET orders status 200": (r) => r.status === 200,
    "GET orders returns array": (r) => Array.isArray(r.json()),
  });

  // ── CREATE (POST /api/orders) ────────────────────────────────────────
  const payload = JSON.stringify({
    userId: "64f111111111111111111111",
    items: [
      {
        productId: "64f222222222222222222222",
        name: "Laptop",
        quantity: 1,
        price: 1200,
        image: "laptop.jpg",
      },
    ],
    shippingAddress: {
      fullName: "John Doe",
      address: "Street 1",
      city: "Algiers",
      postalCode: "16000",
      country: "Algeria",
      phone: "0550000000",
    },
    paymentMethod: "stripe",
    taxPrice: 100,
    shippingPrice: 50,
    totalPrice: 1350,
  });
  res = http.post(BASE_URL, payload, { headers });
  check(res, {
    "POST status 201": (r) => r.status === 201,
    "POST returns _id": (r) => r.json("_id") !== undefined,
    "POST returns userId": (r) => r.json("userId") !== undefined,
    "POST returns items": (r) => Array.isArray(r.json("items")),
    "POST returns shippingAddress": (r) => r.json("shippingAddress") !== null,
    "POST returns paymentMethod": (r) => r.json("paymentMethod") !== undefined,
    "POST returns taxPrice": (r) => r.json("taxPrice") !== undefined,
    "POST returns shippingPrice": (r) => r.json("shippingPrice") !== undefined,
    "POST returns totalPrice": (r) => r.json("totalPrice") !== undefined,
    "POST returns isPaid false": (r) => r.json("isPaid") === false,
    "POST returns isDelivered false": (r) => r.json("isDelivered") === false,
    "POST returns status pending": (r) => r.json("status") === "pending",
    "POST returns createdAt": (r) => r.json("createdAt") !== undefined,
    "POST returns updatedAt": (r) => r.json("updatedAt") !== undefined,
  });

  const orderId = res.json("_id");

  // ── GET BY ID (GET /api/orders/:id) ─────────────────────────────────
  res = http.get(`${BASE_URL}/${orderId}`);
  check(res, {
    "GET by id status 200": (r) => r.status === 200,
    "GET by id returns _id match": (r) => r.json("_id") === orderId,
    "GET by id returns userId": (r) => r.json("userId") !== undefined,
    "GET by id returns items": (r) => Array.isArray(r.json("items")),
    "GET by id returns shippingAddress": (r) => r.json("shippingAddress") !== null,
    "GET by id returns paymentMethod": (r) => r.json("paymentMethod") !== undefined,
    "GET by id returns taxPrice": (r) => r.json("taxPrice") !== undefined,
    "GET by id returns shippingPrice": (r) => r.json("shippingPrice") !== undefined,
    "GET by id returns totalPrice": (r) => r.json("totalPrice") !== undefined,
    "GET by id returns isPaid": (r) => typeof r.json("isPaid") === "boolean",
    "GET by id returns isDelivered": (r) => typeof r.json("isDelivered") === "boolean",
    "GET by id returns status": (r) =>
      ["pending", "processing", "shipped", "delivered", "cancelled"].includes(
        r.json("status")
      ),
    "GET by id returns createdAt": (r) => r.json("createdAt") !== undefined,
    "GET by id returns updatedAt": (r) => r.json("updatedAt") !== undefined,
  });

  // ── PAY (PATCH /api/orders/:id/pay) ─────────────────────────────────
  res = http.patch(
    `${BASE_URL}/${orderId}/pay`,
    JSON.stringify({
      id: "PAY-12345",
      status: "COMPLETED",
      update_time: new Date().toISOString(),
      email_address: "test@test.com",
    }),
    { headers }
  );
  check(res, {
    "PAY status 200": (r) => r.status === 200,
    "PAY returns isPaid true": (r) => r.json("isPaid") === true,
    "PAY returns paidAt": (r) => r.json("paidAt") !== undefined,
    "PAY returns paymentResult.id": (r) =>
      r.json("paymentResult.id") === "PAY-12345",
    "PAY returns paymentResult.status": (r) =>
      r.json("paymentResult.status") === "COMPLETED",
    "PAY returns paymentResult.update_time": (r) =>
      r.json("paymentResult.update_time") !== undefined,
    "PAY returns paymentResult.email_address": (r) =>
      r.json("paymentResult.email_address") === "test@test.com",
    "PAY returns status processing or shipped": (r) =>
      ["processing", "shipped"].includes(r.json("status")),
  });

  // ── DELIVER (PATCH /api/orders/:id/deliver) ─────────────────────────
  res = http.patch(`${BASE_URL}/${orderId}/deliver`, "{}", { headers });
  check(res, {
    "DELIVER status 200": (r) => r.status === 200,
    "DELIVER returns isDelivered true": (r) => r.json("isDelivered") === true,
    "DELIVER returns deliveredAt": (r) => r.json("deliveredAt") !== undefined,
    "DELIVER returns status delivered": (r) => r.json("status") === "delivered",
  });

  // ── CANCEL (PATCH /api/orders/:id/cancel) ───────────────────────────
  // res = http.patch(`${BASE_URL}/${orderId}/cancel`, "{}", { headers });
  // check(res, {
  //   "CANCEL status 200": (r) => r.status === 200,
  //   "CANCEL returns status cancelled": (r) => r.json("status") === "cancelled",
  // });

  // ── DELETE (DELETE /api/orders/:id) ─────────────────────────────────
  res = http.del(`${BASE_URL}/${orderId}`);
  check(res, {
    "DELETE status 200": (r) => r.status === 200,
  });
}
