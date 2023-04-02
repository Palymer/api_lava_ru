import fetch from 'node-fetch';
import { validate } from 'validate-utils';
import { HttpUrl } from 'validate-utils/validators';

class LavaError extends Error {}

interface WithdrawCreateParams {
  account: string;
  amount: number;
  service: string;
  walletTo: string;
  orderId?: string | undefined;
  hookUrl?: string | undefined;
  subtract?: boolean | undefined;
  comment?: string | undefined;
}

interface WithdrawInfoParams {
  id: string;
}

interface TransferCreateParams {
  accountFrom: string;
  accountTo: string;
  amount: number;
  subtract?: boolean | undefined;
  comment?: string | undefined;
}

interface TransferInfoParams {
  id: string;
}

interface TransactionsListParams {
  transferType?: string | undefined;
  account?: string | undefined;
  periodStart?: Date | undefined;
  periodEnd?: Date | undefined;
  offset?: number | undefined;
  limit?: number | undefined;
}

interface InvoiceCreateParams {
  walletTo: string;
  sum: number;
  orderId?: string | undefined;
  hookUrl?: string | undefined;
  successUrl?: string | undefined;
  failUrl?: string | undefined;
  expire?: number | undefined;
  subtract?: boolean | undefined;
  customFields?: string[][] | undefined;
  comment?: string | undefined;
  merchantId?: string | undefined;
  merchantName?: string | undefined;
}

interface InvoiceInfoParams {
  id?: string | undefined;
  orderId?: string | undefined;
}

interface InvoiceSetWebhookParams {
  url: string;
}

class Lava {
  pathPrefix = 'https://api.lava.ru';

  constructor(private apiKey: string) {}

  async testPing() {
    const method = 'GET';
    const path = '/test/ping';
    return await this._request(method, path);
  }

  async walletList() {
    const method = 'GET';
    const path = '/wallet/list';
    return await this._request(method, path);
  }

  @validate
  async withdrawCreate({
    account,
    amount,
    service,
    walletTo,
    orderId = undefined,
    hookUrl = undefined,
    subtract = undefined,
    comment = undefined,
  }: WithdrawCreateParams) {
    const method = 'POST';
    const path = '/withdraw/create';
    const data = {
      account,
      amount,
      service,
      wallet_to: walletTo,
      order_id: orderId,
      hook_url: hookUrl,
      substract: subtract,
      comment,
    };
    return await this._request(method, path, data);
  }

  @validate
  async withdrawInfo({ id }: WithdrawInfoParams) {
    const method = 'POST';
    const path = '/withdraw/info';
    const data = { id };
    return await this._request(method, path, data);
  }

  @validate
  async transferCreate({ accountFrom, accountTo, amount, subtract = undefined, comment = undefined }: TransferCreateParams) {
    const method = 'POST';
    const path = '/transfer/create';
    const data = {
      account_from: accountFrom,
      account_to: accountTo,
      amount,
      subtract,
      comment,
    };
    return await this._request(method, path, data);
  }

  @validate
  async transferInfo({ id }: TransferInfoParams) {
    const method = 'POST';
    const path = '/transfer/info';
    const data = { id };
    return await this._request(method, path, data);
  }

  @validate
  async transactionsList({
    transferType = undefined,
    account = undefined,
    periodStart = undefined,
    periodEnd = undefined,
    offset = undefined,
    limit = undefined,
  }: TransactionsListParams) {
    const method = 'POST';
    const path = '/transactions/list';
    const data = {
      transfer_type: transferType,
      account,
      period_start: periodStart,
      period_end: periodEnd,
      offset,
      limit,
    };
    return await this._request(method, path, data);
  }

  @validate
  async invoiceCreate({
    walletTo,
    sum,
    orderId = undefined,
    hookUrl = undefined,
    successUrl = undefined,
    failUrl = undefined,
    expire = undefined,
    subtract = undefined,
    customFields = undefined,
    comment = undefined,
    merchantId = undefined,
    merchantName = undefined,
  }: InvoiceCreateParams) {
    const method = 'POST';
    const path = '/invoice/create';
    const data = {
      wallet_to: walletTo,
      sum,
      order_id: orderId,
      hook_url: hookUrl,
      success_url: successUrl,
      fail_url: failUrl,
      expire: expire,
      subtract: subtract,
      custom_fields: customFields,
      comment: comment,
      merchant_id: merchantId,
      merchant_name: merchantName,
    };
    return await this._request(method, path, data);
  }

  @validate
  async invoiceInfo({ id = undefined, orderId = undefined }: InvoiceInfoParams) {
    const method = 'POST';
    const path = '/invoice/info';
    const data = { id, order_id: orderId };
    return await this._request(method, path, data);
  }

  @validate
  async invoiceSetWebhook({ url }: InvoiceSetWebhookParams) {
    const method = 'POST';
    const path = '/invoice/set-webhook';
    const data = { url };
    return await this._request(method, path, data);
  }

  async invoiceGenerateSecretKey() {
    const method = 'GET';
    const path = '/invoice/generate-secret-key';
    return await this._request(method, path);
  }

  private async _request(method: string, path: string, data: object = {}): Promise<any> {
    const url = this.pathPrefix + path;
    const headers = {
      Authorization: this.apiKey,
    };
    for (const key of Object.keys(data)) {
      if (data[key] === undefined) delete data[key];
    }
    try {
      const response = await fetch(url, {
        method,
        body: JSON.stringify(data),
        headers,
      });
      const result = await response.json();
      if (typeof result === 'object' && result.status === 'error') {
        throw new LavaError(`${result.code}: ${result.message}`);
      } else {
        return result;
      }
    } catch (error) {
      throw new LavaError(error.message);
    }
  }
}

export default Lava;
