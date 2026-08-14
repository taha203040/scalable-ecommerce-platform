import redisClient from "../config/redis.config";
class Fixed {
    private windowSize: number;
    private limit: number;
    private jedis: any;

    constructor(jedis: any, windowSize: number, limit: number) {
        this.jedis = jedis;
        this.windowSize = windowSize;
        this.limit = limit;
    }

    async isAllowed(clientId: string): Promise<boolean> {
        const key = "rate_limit:" + clientId;
        const currentCountStr = await this.jedis.get(key);
        const currentCount = currentCountStr != null ? parseInt(currentCountStr, 10) : 0;
        const isAllowed = currentCount < this.limit;
        if (isAllowed) {
            const transaction = this.jedis.multi();
            transaction.incr(key);
            transaction.expire(key, this.windowSize, "NX");
            await transaction.exec();
        }
        return isAllowed;
    }
}
export default Fixed
/**
 * async function is_Allowed(clientId: string, limit: number) {
    // get the key 
    // parse the text to intger
    // check the limitation
    // 
    let key: string = 'rate_Limite' + clientId
    let curCountStr = await redis.get(key)
    let curCount = 0
    if (curCountStr) {
        curCount = parseInt(curCountStr)
    }
    let isAllowed = curCount < limit
    if(isAllowed){
        let trans = redis.multi()
        trans.incr(key)        
    }


}
 */
