// ============================================================================
// AUTO-GENERATED TYPES — DO NOT EDIT DIRECTLY
// Run `npm run generate` after updating any *.graphql schema file.
// ============================================================================

@file:Suppress("unused")

// MARK: - Enums

public enum class ErrorCode(val rawValue: String) {
    Unknown("UNKNOWN"),
    UserCancelled("USER_CANCELLED"),
    UserError("USER_ERROR"),
    ItemUnavailable("ITEM_UNAVAILABLE"),
    RemoteError("REMOTE_ERROR"),
    NetworkError("NETWORK_ERROR"),
    ServiceError("SERVICE_ERROR"),
    ReceiptFailed("RECEIPT_FAILED"),
    ReceiptFinished("RECEIPT_FINISHED"),
    ReceiptFinishedFailed("RECEIPT_FINISHED_FAILED"),
    NotPrepared("NOT_PREPARED"),
    NotEnded("NOT_ENDED"),
    AlreadyOwned("ALREADY_OWNED"),
    DeveloperError("DEVELOPER_ERROR"),
    BillingResponseJsonParseError("BILLING_RESPONSE_JSON_PARSE_ERROR"),
    DeferredPayment("DEFERRED_PAYMENT"),
    Interrupted("INTERRUPTED"),
    IapNotAvailable("IAP_NOT_AVAILABLE"),
    PurchaseError("PURCHASE_ERROR"),
    SyncError("SYNC_ERROR"),
    TransactionValidationFailed("TRANSACTION_VALIDATION_FAILED"),
    ActivityUnavailable("ACTIVITY_UNAVAILABLE"),
    AlreadyPrepared("ALREADY_PREPARED"),
    Pending("PENDING"),
    ConnectionClosed("CONNECTION_CLOSED"),
    InitConnection("INIT_CONNECTION"),
    ServiceDisconnected("SERVICE_DISCONNECTED"),
    QueryProduct("QUERY_PRODUCT"),
    SkuNotFound("SKU_NOT_FOUND"),
    SkuOfferMismatch("SKU_OFFER_MISMATCH"),
    ItemNotOwned("ITEM_NOT_OWNED"),
    BillingUnavailable("BILLING_UNAVAILABLE"),
    FeatureNotSupported("FEATURE_NOT_SUPPORTED"),
    EmptySkuList("EMPTY_SKU_LIST")
}

public enum class IapEvent(val rawValue: String) {
    PurchaseUpdated("PURCHASE_UPDATED"),
    PurchaseError("PURCHASE_ERROR"),
    PromotedProductIos("PROMOTED_PRODUCT_IOS")
}

public enum class PaymentModeIOS(val rawValue: String) {
    Empty("EMPTY"),
    FreeTrial("FREE_TRIAL"),
    PayAsYouGo("PAY_AS_YOU_GO"),
    PayUpFront("PAY_UP_FRONT")
}

public enum class Platform(val rawValue: String) {
    Ios("IOS"),
    Android("ANDROID")
}

public enum class ProductQueryType(val rawValue: String) {
    InApp("IN_APP"),
    Subs("SUBS"),
    All("ALL")
}

public enum class ProductType(val rawValue: String) {
    InApp("IN_APP"),
    Subs("SUBS")
}

public enum class ProductTypeIOS(val rawValue: String) {
    Consumable("CONSUMABLE"),
    NonConsumable("NON_CONSUMABLE"),
    AutoRenewableSubscription("AUTO_RENEWABLE_SUBSCRIPTION"),
    NonRenewingSubscription("NON_RENEWING_SUBSCRIPTION")
}

public enum class PurchaseState(val rawValue: String) {
    Pending("PENDING"),
    Purchased("PURCHASED"),
    Failed("FAILED"),
    Restored("RESTORED"),
    Deferred("DEFERRED"),
    Unknown("UNKNOWN")
}

public enum class SubscriptionOfferTypeIOS(val rawValue: String) {
    Introductory("INTRODUCTORY"),
    Promotional("PROMOTIONAL")
}

public enum class SubscriptionPeriodIOS(val rawValue: String) {
    Day("DAY"),
    Week("WEEK"),
    Month("MONTH"),
    Year("YEAR"),
    Empty("EMPTY")
}

// MARK: - Interfaces

public interface ProductCommon {
    val currency: String
    val debugDescription: String?
    val description: String
    val displayName: String?
    val displayPrice: String
    val id: String
    val platform: Platform
    val price: Double?
    val title: String
    val type: ProductType
}

public interface PurchaseCommon {
    val id: String
    val ids: List<String>?
    val isAutoRenewing: Boolean
    val platform: Platform
    val productId: String
    val purchaseState: PurchaseState
    /**
     * Unified purchase token (iOS JWS, Android purchaseToken)
     */
    val purchaseToken: String?
    val quantity: Int
    val transactionDate: Double
}

// MARK: - Objects

public data class ActiveSubscription(
    val autoRenewingAndroid: Boolean? = null,
    val daysUntilExpirationIOS: Double? = null,
    val environmentIOS: String? = null,
    val expirationDateIOS: Double? = null,
    val isActive: Boolean,
    val productId: String,
    val purchaseToken: String? = null,
    val transactionDate: Double,
    val transactionId: String,
    val willExpireSoon: Boolean? = null
)


public data class AppTransaction(
    val appId: Double,
    val appTransactionId: String? = null,
    val appVersion: String,
    val appVersionId: Double,
    val bundleId: String,
    val deviceVerification: String,
    val deviceVerificationNonce: String,
    val environment: String,
    val originalAppVersion: String,
    val originalPlatform: String? = null,
    val originalPurchaseDate: Double,
    val preorderDate: Double? = null,
    val signedDate: Double
)


public data class DiscountIOS(
    val identifier: String,
    val localizedPrice: String? = null,
    val numberOfPeriods: Int,
    val paymentMode: PaymentModeIOS,
    val price: String,
    val priceAmount: Double,
    val subscriptionPeriod: String,
    val type: String
)


public data class DiscountOfferIOS(
    /**
     * Discount identifier
     */
    val identifier: String,
    /**
     * Key identifier for validation
     */
    val keyIdentifier: String,
    /**
     * Cryptographic nonce
     */
    val nonce: String,
    /**
     * Signature for validation
     */
    val signature: String,
    /**
     * Timestamp of discount offer
     */
    val timestamp: Double
)


public data class EntitlementIOS(
    val jsonRepresentation: String,
    val sku: String,
    val transactionId: String
)


public data class FetchProductsResult(
    val products: List<Product>? = null,
    val subscriptions: List<ProductSubscription>? = null
)


public data class PricingPhaseAndroid(
    val billingCycleCount: Int,
    val billingPeriod: String,
    val formattedPrice: String,
    val priceAmountMicros: String,
    val priceCurrencyCode: String,
    val recurrenceMode: Int
)


public data class PricingPhasesAndroid(
    val pricingPhaseList: List<PricingPhaseAndroid>
)


public data class ProductAndroid(
    val currency: String,
    val debugDescription: String? = null,
    val description: String,
    val displayName: String? = null,
    val displayPrice: String,
    val id: String,
    val nameAndroid: String,
    val oneTimePurchaseOfferDetailsAndroid: ProductAndroidOneTimePurchaseOfferDetail? = null,
    val platform: Platform,
    val price: Double? = null,
    val subscriptionOfferDetailsAndroid: List<ProductSubscriptionAndroidOfferDetails>? = null,
    val title: String,
    val type: ProductType
) : ProductCommon, Product


public data class ProductAndroidOneTimePurchaseOfferDetail(
    val formattedPrice: String,
    val priceAmountMicros: String,
    val priceCurrencyCode: String
)


public data class ProductIOS(
    val currency: String,
    val debugDescription: String? = null,
    val description: String,
    val displayName: String? = null,
    val displayNameIOS: String,
    val displayPrice: String,
    val id: String,
    val isFamilyShareableIOS: Boolean,
    val jsonRepresentationIOS: String,
    val platform: Platform,
    val price: Double? = null,
    val subscriptionInfoIOS: SubscriptionInfoIOS? = null,
    val title: String,
    val type: ProductType,
    val typeIOS: ProductTypeIOS
) : ProductCommon, Product


public data class ProductSubscriptionAndroid(
    val currency: String,
    val debugDescription: String? = null,
    val description: String,
    val displayName: String? = null,
    val displayPrice: String,
    val id: String,
    val nameAndroid: String,
    val oneTimePurchaseOfferDetailsAndroid: ProductAndroidOneTimePurchaseOfferDetail? = null,
    val platform: Platform,
    val price: Double? = null,
    val subscriptionOfferDetailsAndroid: List<ProductSubscriptionAndroidOfferDetails>,
    val title: String,
    val type: ProductType
) : ProductCommon, ProductSubscription


public data class ProductSubscriptionAndroidOfferDetails(
    val basePlanId: String,
    val offerId: String? = null,
    val offerTags: List<String>,
    val offerToken: String,
    val pricingPhases: PricingPhasesAndroid
)


public data class ProductSubscriptionIOS(
    val currency: String,
    val debugDescription: String? = null,
    val description: String,
    val discountsIOS: List<DiscountIOS>? = null,
    val displayName: String? = null,
    val displayNameIOS: String,
    val displayPrice: String,
    val id: String,
    val introductoryPriceAsAmountIOS: String? = null,
    val introductoryPriceIOS: String? = null,
    val introductoryPriceNumberOfPeriodsIOS: String? = null,
    val introductoryPricePaymentModeIOS: PaymentModeIOS? = null,
    val introductoryPriceSubscriptionPeriodIOS: SubscriptionPeriodIOS? = null,
    val isFamilyShareableIOS: Boolean,
    val jsonRepresentationIOS: String,
    val platform: Platform,
    val price: Double? = null,
    val subscriptionInfoIOS: SubscriptionInfoIOS? = null,
    val subscriptionPeriodNumberIOS: String? = null,
    val subscriptionPeriodUnitIOS: SubscriptionPeriodIOS? = null,
    val title: String,
    val type: ProductType,
    val typeIOS: ProductTypeIOS
) : ProductCommon, ProductSubscription


public data class PurchaseAndroid(
    val autoRenewingAndroid: Boolean? = null,
    val dataAndroid: String? = null,
    val developerPayloadAndroid: String? = null,
    val id: String,
    val ids: List<String>? = null,
    val isAcknowledgedAndroid: Boolean? = null,
    val isAutoRenewing: Boolean,
    val obfuscatedAccountIdAndroid: String? = null,
    val obfuscatedProfileIdAndroid: String? = null,
    val packageNameAndroid: String? = null,
    val platform: Platform,
    val productId: String,
    val purchaseState: PurchaseState,
    val purchaseToken: String? = null,
    val quantity: Int,
    val signatureAndroid: String? = null,
    val transactionDate: Double
) : PurchaseCommon, Purchase


public data class PurchaseError(
    val code: ErrorCode,
    val message: String,
    val productId: String? = null
)


public data class PurchaseIOS(
    val appAccountToken: String? = null,
    val appBundleIdIOS: String? = null,
    val countryCodeIOS: String? = null,
    val currencyCodeIOS: String? = null,
    val currencySymbolIOS: String? = null,
    val environmentIOS: String? = null,
    val expirationDateIOS: Double? = null,
    val id: String,
    val ids: List<String>? = null,
    val isAutoRenewing: Boolean,
    val isUpgradedIOS: Boolean? = null,
    val offerIOS: PurchaseOfferIOS? = null,
    val originalTransactionDateIOS: Double? = null,
    val originalTransactionIdentifierIOS: String? = null,
    val ownershipTypeIOS: String? = null,
    val platform: Platform,
    val productId: String,
    val purchaseState: PurchaseState,
    val purchaseToken: String? = null,
    val quantity: Int,
    val quantityIOS: Int? = null,
    val reasonIOS: String? = null,
    val reasonStringRepresentationIOS: String? = null,
    val revocationDateIOS: Double? = null,
    val revocationReasonIOS: String? = null,
    val storefrontCountryCodeIOS: String? = null,
    val subscriptionGroupIdIOS: String? = null,
    val transactionDate: Double,
    val transactionReasonIOS: String? = null,
    val webOrderLineItemIdIOS: String? = null
) : PurchaseCommon, Purchase


public data class PurchaseOfferIOS(
    val id: String,
    val paymentMode: String,
    val type: String
)


public data class ReceiptValidationResultAndroid(
    val autoRenewing: Boolean,
    val betaProduct: Boolean,
    val cancelDate: Double? = null,
    val cancelReason: String? = null,
    val deferredDate: Double? = null,
    val deferredSku: Double? = null,
    val freeTrialEndDate: Double,
    val gracePeriodEndDate: Double,
    val parentProductId: String,
    val productId: String,
    val productType: String,
    val purchaseDate: Double,
    val quantity: Int,
    val receiptId: String,
    val renewalDate: Double,
    val term: String,
    val termSku: String,
    val testTransaction: Boolean
) : ReceiptValidationResult


public data class ReceiptValidationResultIOS(
    /**
     * Whether the receipt is valid
     */
    val isValid: Boolean,
    /**
     * JWS representation
     */
    val jwsRepresentation: String,
    /**
     * Latest transaction if available
     */
    val latestTransaction: Purchase? = null,
    /**
     * Receipt data string
     */
    val receiptData: String
) : ReceiptValidationResult


public data class RefundResultIOS(
    val message: String? = null,
    val status: String
)


public data class RenewalInfoIOS(
    val autoRenewPreference: String? = null,
    val jsonRepresentation: String? = null,
    val willAutoRenew: Boolean
)


public data class RequestPurchaseResult(
    val purchase: Purchase? = null,
    val purchases: List<Purchase>? = null
)


public data class SubscriptionInfoIOS(
    val introductoryOffer: SubscriptionOfferIOS? = null,
    val promotionalOffers: List<SubscriptionOfferIOS>? = null,
    val subscriptionGroupId: String,
    val subscriptionPeriod: SubscriptionPeriodValueIOS
)


public data class SubscriptionOfferIOS(
    val displayPrice: String,
    val id: String,
    val paymentMode: PaymentModeIOS,
    val period: SubscriptionPeriodValueIOS,
    val periodCount: Int,
    val price: Double,
    val type: SubscriptionOfferTypeIOS
)


public data class SubscriptionPeriodValueIOS(
    val unit: SubscriptionPeriodIOS,
    val value: Int
)


public data class SubscriptionStatusIOS(
    val renewalInfo: RenewalInfoIOS? = null,
    val state: String
)


public data class VoidResult(
    val success: Boolean
)


// MARK: - Input Objects

public data class AndroidSubscriptionOfferInput(
    /**
     * Offer token
     */
    val offerToken: String,
    /**
     * Product SKU
     */
    val sku: String
)

public data class DeepLinkOptions(
    /**
     * Android package name to target (required on Android)
     */
    val packageNameAndroid: String? = null,
    /**
     * Android SKU to open (required on Android)
     */
    val skuAndroid: String? = null
)

public data class DiscountOfferInputIOS(
    /**
     * Discount identifier
     */
    val identifier: String,
    /**
     * Key identifier for validation
     */
    val keyIdentifier: String,
    /**
     * Cryptographic nonce
     */
    val nonce: String,
    /**
     * Signature for validation
     */
    val signature: String,
    /**
     * Timestamp of discount offer
     */
    val timestamp: Double
)

public data class ProductRequest(
    val skus: List<String>,
    val type: ProductQueryType? = null
)

public data class PurchaseInput(
    val id: String,
    val ids: List<String>? = null,
    val isAutoRenewing: Boolean,
    val platform: Platform,
    val productId: String,
    val purchaseState: PurchaseState,
    val purchaseToken: String? = null,
    val quantity: Int,
    val transactionDate: Double
)

public data class PurchaseOptions(
    /**
     * Also emit results through the iOS event listeners
     */
    val alsoPublishToEventListenerIOS: Boolean? = null,
    /**
     * Limit to currently active items on iOS
     */
    val onlyIncludeActiveItemsIOS: Boolean? = null
)

public data class PurchaseParams(
    /**
     * Per-platform purchase request props
     */
    val requestPurchase: RequestPurchasePropsByPlatforms? = null,
    /**
     * Per-platform subscription request props
     */
    val requestSubscription: RequestSubscriptionPropsByPlatforms? = null,
    /**
     * Explicit purchase type hint (defaults to in-app)
     */
    val type: ProductQueryType? = null
)

public data class ReceiptValidationAndroidOptions(
    val accessToken: String,
    val isSub: Boolean? = null,
    val packageName: String,
    val productToken: String
)

public data class ReceiptValidationProps(
    /**
     * Android-specific validation options
     */
    val androidOptions: ReceiptValidationAndroidOptions? = null,
    /**
     * Product SKU to validate
     */
    val sku: String
)

public data class RequestPurchaseAndroidProps(
    /**
     * Personalized offer flag
     */
    val isOfferPersonalized: Boolean? = null,
    /**
     * Obfuscated account ID
     */
    val obfuscatedAccountIdAndroid: String? = null,
    /**
     * Obfuscated profile ID
     */
    val obfuscatedProfileIdAndroid: String? = null,
    /**
     * List of product SKUs
     */
    val skus: List<String>
)

public data class RequestPurchaseIosProps(
    /**
     * Auto-finish transaction (dangerous)
     */
    val andDangerouslyFinishTransactionAutomatically: Boolean? = null,
    /**
     * App account token for user tracking
     */
    val appAccountToken: String? = null,
    /**
     * Purchase quantity
     */
    val quantity: Int? = null,
    /**
     * Product SKU
     */
    val sku: String,
    /**
     * Discount offer to apply
     */
    val withOffer: DiscountOfferInputIOS? = null
)

public data class RequestPurchaseProps(
    /**
     * Android-specific purchase parameters
     */
    val android: RequestPurchaseAndroidProps? = null,
    /**
     * iOS-specific purchase parameters
     */
    val ios: RequestPurchaseIosProps? = null
)

public data class RequestPurchasePropsByPlatforms(
    /**
     * Android-specific purchase parameters
     */
    val android: RequestPurchaseAndroidProps? = null,
    /**
     * iOS-specific purchase parameters
     */
    val ios: RequestPurchaseIosProps? = null
)

public data class RequestSubscriptionAndroidProps(
    /**
     * Personalized offer flag
     */
    val isOfferPersonalized: Boolean? = null,
    /**
     * Obfuscated account ID
     */
    val obfuscatedAccountIdAndroid: String? = null,
    /**
     * Obfuscated profile ID
     */
    val obfuscatedProfileIdAndroid: String? = null,
    /**
     * Purchase token for upgrades/downgrades
     */
    val purchaseTokenAndroid: String? = null,
    /**
     * Replacement mode for subscription changes
     */
    val replacementModeAndroid: Int? = null,
    /**
     * List of subscription SKUs
     */
    val skus: List<String>,
    /**
     * Subscription offers
     */
    val subscriptionOffers: List<AndroidSubscriptionOfferInput>? = null
)

public data class RequestSubscriptionIosProps(
    val andDangerouslyFinishTransactionAutomatically: Boolean? = null,
    val appAccountToken: String? = null,
    val quantity: Int? = null,
    val sku: String,
    val withOffer: DiscountOfferInputIOS? = null
)

public data class RequestSubscriptionPropsByPlatforms(
    /**
     * Android-specific subscription parameters
     */
    val android: RequestSubscriptionAndroidProps? = null,
    /**
     * iOS-specific subscription parameters
     */
    val ios: RequestPurchaseIosProps? = null
)

// MARK: - Unions

public sealed interface Product

public sealed interface ProductSubscription

public sealed interface Purchase

public sealed interface ReceiptValidationResult

// MARK: - Root Operations

/**
 * GraphQL root mutation operations.
 */
public interface MutationResolver {
    suspend fun _placeholder(): Boolean?
    /**
     * Acknowledge a non-consumable purchase or subscription
     */
    suspend fun acknowledgePurchaseAndroid(purchaseToken: String): VoidResult
    /**
     * Initiate a refund request for a product (iOS 15+)
     */
    suspend fun beginRefundRequestIOS(sku: String): RefundResultIOS
    /**
     * Clear pending transactions from the StoreKit payment queue
     */
    suspend fun clearTransactionIOS(): VoidResult
    /**
     * Consume a purchase token so it can be repurchased
     */
    suspend fun consumePurchaseAndroid(purchaseToken: String): VoidResult
    /**
     * Open the native subscription management surface
     */
    suspend fun deepLinkToSubscriptions(options: DeepLinkOptions? = null): VoidResult
    /**
     * Close the platform billing connection
     */
    suspend fun endConnection(): Boolean
    /**
     * Finish a transaction after validating receipts
     */
    suspend fun finishTransaction(purchase: PurchaseInput, isConsumable: Boolean? = null): VoidResult
    /**
     * Establish the platform billing connection
     */
    suspend fun initConnection(): Boolean
    /**
     * Present the App Store code redemption sheet
     */
    suspend fun presentCodeRedemptionSheetIOS(): VoidResult
    /**
     * Initiate a purchase flow; rely on events for final state
     */
    suspend fun requestPurchase(params: PurchaseParams): RequestPurchaseResult?
    /**
     * Purchase the promoted product surfaced by the App Store
     */
    suspend fun requestPurchaseOnPromotedProductIOS(): PurchaseIOS
    /**
     * Restore completed purchases across platforms
     */
    suspend fun restorePurchases(): VoidResult
    /**
     * Open subscription management UI and return changed purchases (iOS 15+)
     */
    suspend fun showManageSubscriptionsIOS(): List<PurchaseIOS>
    /**
     * Force a StoreKit sync for transactions (iOS 15+)
     */
    suspend fun syncIOS(): VoidResult
    /**
     * Validate purchase receipts with the configured providers
     */
    suspend fun validateReceipt(options: ReceiptValidationProps): ReceiptValidationResult
}

/**
 * GraphQL root query operations.
 */
public interface QueryResolver {
    suspend fun _placeholder(): Boolean?
    /**
     * Get current StoreKit 2 entitlements (iOS 15+)
     */
    suspend fun currentEntitlementIOS(skus: List<String>? = null): List<EntitlementIOS>
    /**
     * Retrieve products or subscriptions from the store
     */
    suspend fun fetchProducts(params: ProductRequest): FetchProductsResult
    /**
     * Get active subscriptions (filters by subscriptionIds when provided)
     */
    suspend fun getActiveSubscriptions(subscriptionIds: List<String>? = null): List<ActiveSubscription>
    /**
     * Fetch the current app transaction (iOS 16+)
     */
    suspend fun getAppTransactionIOS(): AppTransaction?
    /**
     * Get all available purchases for the current user
     */
    suspend fun getAvailablePurchases(options: PurchaseOptions? = null): List<Purchase>
    /**
     * Retrieve all pending transactions in the StoreKit queue
     */
    suspend fun getPendingTransactionsIOS(): List<PurchaseIOS>
    /**
     * Get the currently promoted product (iOS 11+)
     */
    suspend fun getPromotedProductIOS(): ProductIOS?
    /**
     * Get base64-encoded receipt data for validation
     */
    suspend fun getReceiptDataIOS(): String
    /**
     * Get the current App Store storefront country code
     */
    suspend fun getStorefrontIOS(): String
    /**
     * Get the transaction JWS (StoreKit 2)
     */
    suspend fun getTransactionJwsIOS(transactionId: String): String
    /**
     * Check whether the user has active subscriptions
     */
    suspend fun hasActiveSubscriptions(subscriptionIds: List<String>? = null): Boolean
    /**
     * Check introductory offer eligibility for specific products
     */
    suspend fun isEligibleForIntroOfferIOS(productIds: List<String>): Boolean
    /**
     * Verify a StoreKit 2 transaction signature
     */
    suspend fun isTransactionVerifiedIOS(transactionId: String): Boolean
    /**
     * Get the latest transaction for a product using StoreKit 2
     */
    suspend fun latestTransactionIOS(sku: String): PurchaseIOS?
    /**
     * Get StoreKit 2 subscription status details (iOS 15+)
     */
    suspend fun subscriptionStatusIOS(skus: List<String>? = null): List<SubscriptionStatusIOS>
}

/**
 * GraphQL root subscription operations.
 */
public interface SubscriptionResolver {
    suspend fun _placeholder(): Boolean?
    /**
     * Fires when the App Store surfaces a promoted product (iOS only)
     */
    suspend fun promotedProductIOS(): String
    /**
     * Fires when a purchase fails or is cancelled
     */
    suspend fun purchaseError(): PurchaseError
    /**
     * Fires when a purchase completes successfully or a pending purchase resolves
     */
    suspend fun purchaseUpdated(): Purchase
}
