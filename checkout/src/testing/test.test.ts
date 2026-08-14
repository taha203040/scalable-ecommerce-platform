import Fixed from "../Middleware/rateLimiter.middleware";
// import { beforeEach } from "jest";
describe("Fixed Rate Limiter", () => {
    let mockJedis: any ;
    let rateLimiter: Fixed;

    beforeEach(() => {
        const mockTransaction = {
            incr: jest.fn().mockReturnThis(),
            expire: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue([1, 1]),
        };

        mockJedis = {
            get: jest.fn(),
            multi: jest.fn().mockReturnValue(mockTransaction),
        };

        rateLimiter = new Fixed(mockJedis, 60, 5);
    });

    it("should allow requests within the limit", async () => {
        mockJedis.get.mockResolvedValue("3"); // current count is 3, limit is 5

        const result = await rateLimiter.isAllowed("client-123");

        expect(result).toBe(true);
    });

    it("should allow request when count is zero (first request)", async () => {
        mockJedis.get.mockResolvedValue(null);

        const result = await rateLimiter.isAllowed("client-123");

        expect(result).toBe(true);
    });

    it("should allow request when count is exactly one below the limit", async () => {
        mockJedis.get.mockResolvedValue("4"); // limit is 5

        const result = await rateLimiter.isAllowed("client-123");

        expect(result).toBe(true);
    });

    it("should increment the counter when request is allowed", async () => {
        mockJedis.get.mockResolvedValue("2");
        const transaction = mockJedis.multi();

        await rateLimiter.isAllowed("client-123");

        expect(transaction.incr).toHaveBeenCalledWith("rate_limit:client-123");
        expect(transaction.expire).toHaveBeenCalledWith("rate_limit:client-123", 60, "NX");
        expect(transaction.exec).toHaveBeenCalled();
    });

    it("should block request when count equals the limit", async () => {
        mockJedis.get.mockResolvedValue("5"); // count == limit

        const result = await rateLimiter.isAllowed("client-123");

        expect(result).toBe(false);
    });

    it("should not increment counter when request is blocked", async () => {
        mockJedis.get.mockResolvedValue("5");
        const transaction = mockJedis.multi();

        await rateLimiter.isAllowed("client-123");

        expect(transaction.exec).not.toHaveBeenCalled();
    });
    it("should respect FREE_TIER limit of 10", async () => {
        const freeRateLimiter = new Fixed(mockJedis, 60, 10);
        mockJedis.get.mockResolvedValue("10");

        const result = await freeRateLimiter.isAllowed("client-free");

        expect(result).toBe(false);
    });

    it("should respect PREMIUM_TIER limit of 500", async () => {
        const premiumRateLimiter = new Fixed(mockJedis, 60, 500);
        mockJedis.get.mockResolvedValue("500");

        const result = await premiumRateLimiter.isAllowed("client-premium");

        expect(result).toBe(false);
    });

    it("should respect ENTERPRIZE_TIER limit of 1000", async () => {
        const enterpriseRateLimiter = new Fixed(mockJedis, 60, 1000);
        mockJedis.get.mockResolvedValue("1000");

        const result = await enterpriseRateLimiter.isAllowed("client-enterprise");

        expect(result).toBe(false);
    });

    it("should allow PREMIUM_TIER request when under limit", async () => {
        const premiumRateLimiter = new Fixed(mockJedis, 60, 500);
        mockJedis.get.mockResolvedValue("499");

        const result = await premiumRateLimiter.isAllowed("client-premium");

        expect(result).toBe(true);
    });

    it("should allow ENTERPRIZE_TIER request when under limit", async () => {
        const enterpriseRateLimiter = new Fixed(mockJedis, 60, 1000);
        mockJedis.get.mockResolvedValue("999");

        const result = await enterpriseRateLimiter.isAllowed("client-enterprise");

        expect(result).toBe(true);
    });
});