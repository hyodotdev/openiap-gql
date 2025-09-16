// ============================================================================
// AUTO-GENERATED TYPES — DO NOT EDIT DIRECTLY
// Run `npm run generate` after updating any *.graphql schema file.
// ============================================================================

import Foundation

// MARK: - Enums

public enum ErrorCode: String, Codable, CaseIterable {
    case unknown = "UNKNOWN"
    case userCancelled = "USER_CANCELLED"
    case userError = "USER_ERROR"
    case itemUnavailable = "ITEM_UNAVAILABLE"
    case remoteError = "REMOTE_ERROR"
    case networkError = "NETWORK_ERROR"
    case serviceError = "SERVICE_ERROR"
    case receiptFailed = "RECEIPT_FAILED"
    case receiptFinished = "RECEIPT_FINISHED"
    case receiptFinishedFailed = "RECEIPT_FINISHED_FAILED"
    case notPrepared = "NOT_PREPARED"
    case notEnded = "NOT_ENDED"
    case alreadyOwned = "ALREADY_OWNED"
    case developerError = "DEVELOPER_ERROR"
    case billingResponseJsonParseError = "BILLING_RESPONSE_JSON_PARSE_ERROR"
    case deferredPayment = "DEFERRED_PAYMENT"
    case interrupted = "INTERRUPTED"
    case iapNotAvailable = "IAP_NOT_AVAILABLE"
    case purchaseError = "PURCHASE_ERROR"
    case syncError = "SYNC_ERROR"
    case transactionValidationFailed = "TRANSACTION_VALIDATION_FAILED"
    case activityUnavailable = "ACTIVITY_UNAVAILABLE"
    case alreadyPrepared = "ALREADY_PREPARED"
    case pending = "PENDING"
    case connectionClosed = "CONNECTION_CLOSED"
    case initConnection = "INIT_CONNECTION"
    case serviceDisconnected = "SERVICE_DISCONNECTED"
    case queryProduct = "QUERY_PRODUCT"
    case skuNotFound = "SKU_NOT_FOUND"
    case skuOfferMismatch = "SKU_OFFER_MISMATCH"
    case itemNotOwned = "ITEM_NOT_OWNED"
    case billingUnavailable = "BILLING_UNAVAILABLE"
    case featureNotSupported = "FEATURE_NOT_SUPPORTED"
    case emptySkuList = "EMPTY_SKU_LIST"
}

public enum IapEvent: String, Codable, CaseIterable {
    case purchaseUpdated = "PURCHASE_UPDATED"
    case purchaseError = "PURCHASE_ERROR"
    case promotedProductIos = "PROMOTED_PRODUCT_IOS"
}

public enum IapPlatform: String, Codable, CaseIterable {
    case ios = "IOS"
    case android = "ANDROID"
}

public enum PaymentModeIOS: String, Codable, CaseIterable {
    case empty = "EMPTY"
    case freeTrial = "FREE_TRIAL"
    case payAsYouGo = "PAY_AS_YOU_GO"
    case payUpFront = "PAY_UP_FRONT"
}

public enum ProductQueryType: String, Codable, CaseIterable {
    case inApp = "IN_APP"
    case subs = "SUBS"
    case all = "ALL"
}

public enum ProductType: String, Codable, CaseIterable {
    case inApp = "IN_APP"
    case subs = "SUBS"
}

public enum ProductTypeIOS: String, Codable, CaseIterable {
    case consumable = "CONSUMABLE"
    case nonConsumable = "NON_CONSUMABLE"
    case autoRenewableSubscription = "AUTO_RENEWABLE_SUBSCRIPTION"
    case nonRenewingSubscription = "NON_RENEWING_SUBSCRIPTION"
}

public enum PurchaseState: String, Codable, CaseIterable {
    case pending = "PENDING"
    case purchased = "PURCHASED"
    case failed = "FAILED"
    case restored = "RESTORED"
    case deferred = "DEFERRED"
    case unknown = "UNKNOWN"
}

public enum SubscriptionOfferTypeIOS: String, Codable, CaseIterable {
    case introductory = "INTRODUCTORY"
    case promotional = "PROMOTIONAL"
}

public enum SubscriptionPeriodIOS: String, Codable, CaseIterable {
    case day = "DAY"
    case week = "WEEK"
    case month = "MONTH"
    case year = "YEAR"
    case empty = "EMPTY"
}

// MARK: - Interfaces

public protocol ProductCommon: Codable {
    var currency: String { get }
    var debugDescription: String? { get }
    var description: String { get }
    var displayName: String? { get }
    var displayPrice: String { get }
    var id: String { get }
    var platform: IapPlatform { get }
    var price: Double? { get }
    var title: String { get }
    var type: ProductType { get }
}

public protocol PurchaseCommon: Codable {
    var id: String { get }
    var ids: [String]? { get }
    var isAutoRenewing: Bool { get }
    var platform: IapPlatform { get }
    var productId: String { get }
    var purchaseState: PurchaseState { get }
    /// Unified purchase token (iOS JWS, Android purchaseToken)
    var purchaseToken: String? { get }
    var quantity: Int { get }
    var transactionDate: Double { get }
}

// MARK: - Objects

public struct ActiveSubscription: Codable {
    public var autoRenewingAndroid: Bool?
    public var daysUntilExpirationIOS: Double?
    public var environmentIOS: String?
    public var expirationDateIOS: Double?
    public var isActive: Bool
    public var productId: String
    public var purchaseToken: String?
    public var transactionDate: Double
    public var transactionId: String
    public var willExpireSoon: Bool?
}

public struct AppTransaction: Codable {
    public var appId: Double
    public var appTransactionId: String?
    public var appVersion: String
    public var appVersionId: Double
    public var bundleId: String
    public var deviceVerification: String
    public var deviceVerificationNonce: String
    public var environment: String
    public var originalAppVersion: String
    public var originalPlatform: String?
    public var originalPurchaseDate: Double
    public var preorderDate: Double?
    public var signedDate: Double
}

public struct DiscountIOS: Codable {
    public var identifier: String
    public var localizedPrice: String?
    public var numberOfPeriods: Int
    public var paymentMode: PaymentModeIOS
    public var price: String
    public var priceAmount: Double
    public var subscriptionPeriod: String
    public var type: String
}

public struct DiscountOfferIOS: Codable {
    /// Discount identifier
    public var identifier: String
    /// Key identifier for validation
    public var keyIdentifier: String
    /// Cryptographic nonce
    public var nonce: String
    /// Signature for validation
    public var signature: String
    /// Timestamp of discount offer
    public var timestamp: Double
}

public struct EntitlementIOS: Codable {
    public var jsonRepresentation: String
    public var sku: String
    public var transactionId: String
}

public struct FetchProductsResult: Codable {
    public var products: [Product]?
    public var subscriptions: [ProductSubscription]?
}

public struct PricingPhaseAndroid: Codable {
    public var billingCycleCount: Int
    public var billingPeriod: String
    public var formattedPrice: String
    public var priceAmountMicros: String
    public var priceCurrencyCode: String
    public var recurrenceMode: Int
}

public struct PricingPhasesAndroid: Codable {
    public var pricingPhaseList: [PricingPhaseAndroid]
}

public struct ProductAndroid: Codable, ProductCommon {
    public var currency: String
    public var debugDescription: String?
    public var description: String
    public var displayName: String?
    public var displayPrice: String
    public var id: String
    public var nameAndroid: String
    public var oneTimePurchaseOfferDetailsAndroid: ProductAndroidOneTimePurchaseOfferDetail?
    public var platform: IapPlatform
    public var price: Double?
    public var subscriptionOfferDetailsAndroid: [ProductSubscriptionAndroidOfferDetails]?
    public var title: String
    public var type: ProductType
}

public struct ProductAndroidOneTimePurchaseOfferDetail: Codable {
    public var formattedPrice: String
    public var priceAmountMicros: String
    public var priceCurrencyCode: String
}

public struct ProductIOS: Codable, ProductCommon {
    public var currency: String
    public var debugDescription: String?
    public var description: String
    public var displayName: String?
    public var displayNameIOS: String
    public var displayPrice: String
    public var id: String
    public var isFamilyShareableIOS: Bool
    public var jsonRepresentationIOS: String
    public var platform: IapPlatform
    public var price: Double?
    public var subscriptionInfoIOS: SubscriptionInfoIOS?
    public var title: String
    public var type: ProductType
    public var typeIOS: ProductTypeIOS
}

public struct ProductSubscriptionAndroid: Codable, ProductCommon {
    public var currency: String
    public var debugDescription: String?
    public var description: String
    public var displayName: String?
    public var displayPrice: String
    public var id: String
    public var nameAndroid: String
    public var oneTimePurchaseOfferDetailsAndroid: ProductAndroidOneTimePurchaseOfferDetail?
    public var platform: IapPlatform
    public var price: Double?
    public var subscriptionOfferDetailsAndroid: [ProductSubscriptionAndroidOfferDetails]
    public var title: String
    public var type: ProductType
}

public struct ProductSubscriptionAndroidOfferDetails: Codable {
    public var basePlanId: String
    public var offerId: String?
    public var offerTags: [String]
    public var offerToken: String
    public var pricingPhases: PricingPhasesAndroid
}

public struct ProductSubscriptionIOS: Codable, ProductCommon {
    public var currency: String
    public var debugDescription: String?
    public var description: String
    public var discountsIOS: [DiscountIOS]?
    public var displayName: String?
    public var displayNameIOS: String
    public var displayPrice: String
    public var id: String
    public var introductoryPriceAsAmountIOS: String?
    public var introductoryPriceIOS: String?
    public var introductoryPriceNumberOfPeriodsIOS: String?
    public var introductoryPricePaymentModeIOS: PaymentModeIOS?
    public var introductoryPriceSubscriptionPeriodIOS: SubscriptionPeriodIOS?
    public var isFamilyShareableIOS: Bool
    public var jsonRepresentationIOS: String
    public var platform: IapPlatform
    public var price: Double?
    public var subscriptionInfoIOS: SubscriptionInfoIOS?
    public var subscriptionPeriodNumberIOS: String?
    public var subscriptionPeriodUnitIOS: SubscriptionPeriodIOS?
    public var title: String
    public var type: ProductType
    public var typeIOS: ProductTypeIOS
}

public struct PurchaseAndroid: Codable, PurchaseCommon {
    public var autoRenewingAndroid: Bool?
    public var dataAndroid: String?
    public var developerPayloadAndroid: String?
    public var id: String
    public var ids: [String]?
    public var isAcknowledgedAndroid: Bool?
    public var isAutoRenewing: Bool
    public var obfuscatedAccountIdAndroid: String?
    public var obfuscatedProfileIdAndroid: String?
    public var packageNameAndroid: String?
    public var platform: IapPlatform
    public var productId: String
    public var purchaseState: PurchaseState
    public var purchaseToken: String?
    public var quantity: Int
    public var signatureAndroid: String?
    public var transactionDate: Double
}

public struct PurchaseError: Codable {
    public var code: ErrorCode
    public var message: String
    public var productId: String?
}

public struct PurchaseIOS: Codable, PurchaseCommon {
    public var appAccountToken: String?
    public var appBundleIdIOS: String?
    public var countryCodeIOS: String?
    public var currencyCodeIOS: String?
    public var currencySymbolIOS: String?
    public var environmentIOS: String?
    public var expirationDateIOS: Double?
    public var id: String
    public var ids: [String]?
    public var isAutoRenewing: Bool
    public var isUpgradedIOS: Bool?
    public var offerIOS: PurchaseOfferIOS?
    public var originalTransactionDateIOS: Double?
    public var originalTransactionIdentifierIOS: String?
    public var ownershipTypeIOS: String?
    public var platform: IapPlatform
    public var productId: String
    public var purchaseState: PurchaseState
    public var purchaseToken: String?
    public var quantity: Int
    public var quantityIOS: Int?
    public var reasonIOS: String?
    public var reasonStringRepresentationIOS: String?
    public var revocationDateIOS: Double?
    public var revocationReasonIOS: String?
    public var storefrontCountryCodeIOS: String?
    public var subscriptionGroupIdIOS: String?
    public var transactionDate: Double
    public var transactionReasonIOS: String?
    public var webOrderLineItemIdIOS: String?
}

public struct PurchaseOfferIOS: Codable {
    public var id: String
    public var paymentMode: String
    public var type: String
}

public struct ReceiptValidationResultAndroid: Codable {
    public var autoRenewing: Bool
    public var betaProduct: Bool
    public var cancelDate: Double?
    public var cancelReason: String?
    public var deferredDate: Double?
    public var deferredSku: String?
    public var freeTrialEndDate: Double
    public var gracePeriodEndDate: Double
    public var parentProductId: String
    public var productId: String
    public var productType: String
    public var purchaseDate: Double
    public var quantity: Int
    public var receiptId: String
    public var renewalDate: Double
    public var term: String
    public var termSku: String
    public var testTransaction: Bool
}

public struct ReceiptValidationResultIOS: Codable {
    /// Whether the receipt is valid
    public var isValid: Bool
    /// JWS representation
    public var jwsRepresentation: String
    /// Latest transaction if available
    public var latestTransaction: Purchase?
    /// Receipt data string
    public var receiptData: String
}

public struct RefundResultIOS: Codable {
    public var message: String?
    public var status: String
}

public struct RenewalInfoIOS: Codable {
    public var autoRenewPreference: String?
    public var jsonRepresentation: String?
    public var willAutoRenew: Bool
}

public struct RequestPurchaseResult: Codable {
    public var purchase: Purchase?
    public var purchases: [Purchase]?
}

public struct SubscriptionInfoIOS: Codable {
    public var introductoryOffer: SubscriptionOfferIOS?
    public var promotionalOffers: [SubscriptionOfferIOS]?
    public var subscriptionGroupId: String
    public var subscriptionPeriod: SubscriptionPeriodValueIOS
}

public struct SubscriptionOfferIOS: Codable {
    public var displayPrice: String
    public var id: String
    public var paymentMode: PaymentModeIOS
    public var period: SubscriptionPeriodValueIOS
    public var periodCount: Int
    public var price: Double
    public var type: SubscriptionOfferTypeIOS
}

public struct SubscriptionPeriodValueIOS: Codable {
    public var unit: SubscriptionPeriodIOS
    public var value: Int
}

public struct SubscriptionStatusIOS: Codable {
    public var renewalInfo: RenewalInfoIOS?
    public var state: String
}

public struct VoidResult: Codable {
    public var success: Bool
}

// MARK: - Input Objects

public struct AndroidSubscriptionOfferInput: Codable {
    /// Offer token
    public var offerToken: String
    /// Product SKU
    public var sku: String
}

public struct DeepLinkOptions: Codable {
    /// Android package name to target (required on Android)
    public var packageNameAndroid: String?
    /// Android SKU to open (required on Android)
    public var skuAndroid: String?
}

public struct DiscountOfferInputIOS: Codable {
    /// Discount identifier
    public var identifier: String
    /// Key identifier for validation
    public var keyIdentifier: String
    /// Cryptographic nonce
    public var nonce: String
    /// Signature for validation
    public var signature: String
    /// Timestamp of discount offer
    public var timestamp: Double
}

public struct ProductRequest: Codable {
    public var skus: [String]
    public var type: ProductQueryType?
}

public struct PurchaseInput: Codable {
    public var id: String
    public var ids: [String]?
    public var isAutoRenewing: Bool
    public var platform: IapPlatform
    public var productId: String
    public var purchaseState: PurchaseState
    public var purchaseToken: String?
    public var quantity: Int
    public var transactionDate: Double
}

public struct PurchaseOptions: Codable {
    /// Also emit results through the iOS event listeners
    public var alsoPublishToEventListenerIOS: Bool?
    /// Limit to currently active items on iOS
    public var onlyIncludeActiveItemsIOS: Bool?
}

public struct PurchaseParams: Codable {
    /// Per-platform purchase request props
    public var requestPurchase: RequestPurchasePropsByPlatforms?
    /// Per-platform subscription request props
    public var requestSubscription: RequestSubscriptionPropsByPlatforms?
    /// Explicit purchase type hint (defaults to in-app)
    public var type: ProductQueryType?
}

public struct ReceiptValidationAndroidOptions: Codable {
    public var accessToken: String
    public var isSub: Bool?
    public var packageName: String
    public var productToken: String
}

public struct ReceiptValidationProps: Codable {
    /// Android-specific validation options
    public var androidOptions: ReceiptValidationAndroidOptions?
    /// Product SKU to validate
    public var sku: String
}

public struct RequestPurchaseAndroidProps: Codable {
    /// Personalized offer flag
    public var isOfferPersonalized: Bool?
    /// Obfuscated account ID
    public var obfuscatedAccountIdAndroid: String?
    /// Obfuscated profile ID
    public var obfuscatedProfileIdAndroid: String?
    /// List of product SKUs
    public var skus: [String]
}

public struct RequestPurchaseIosProps: Codable {
    /// Auto-finish transaction (dangerous)
    public var andDangerouslyFinishTransactionAutomatically: Bool?
    /// App account token for user tracking
    public var appAccountToken: String?
    /// Purchase quantity
    public var quantity: Int?
    /// Product SKU
    public var sku: String
    /// Discount offer to apply
    public var withOffer: DiscountOfferInputIOS?
}

public struct RequestPurchaseProps: Codable {
    /// Android-specific purchase parameters
    public var android: RequestPurchaseAndroidProps?
    /// iOS-specific purchase parameters
    public var ios: RequestPurchaseIosProps?
}

public struct RequestPurchasePropsByPlatforms: Codable {
    /// Android-specific purchase parameters
    public var android: RequestPurchaseAndroidProps?
    /// iOS-specific purchase parameters
    public var ios: RequestPurchaseIosProps?
}

public struct RequestSubscriptionAndroidProps: Codable {
    /// Personalized offer flag
    public var isOfferPersonalized: Bool?
    /// Obfuscated account ID
    public var obfuscatedAccountIdAndroid: String?
    /// Obfuscated profile ID
    public var obfuscatedProfileIdAndroid: String?
    /// Purchase token for upgrades/downgrades
    public var purchaseTokenAndroid: String?
    /// Replacement mode for subscription changes
    public var replacementModeAndroid: Int?
    /// List of subscription SKUs
    public var skus: [String]
    /// Subscription offers
    public var subscriptionOffers: [AndroidSubscriptionOfferInput]?
}

public struct RequestSubscriptionIosProps: Codable {
    public var andDangerouslyFinishTransactionAutomatically: Bool?
    public var appAccountToken: String?
    public var quantity: Int?
    public var sku: String
    public var withOffer: DiscountOfferInputIOS?
}

public struct RequestSubscriptionPropsByPlatforms: Codable {
    /// Android-specific subscription parameters
    public var android: RequestSubscriptionAndroidProps?
    /// iOS-specific subscription parameters
    public var ios: RequestSubscriptionIosProps?
}

// MARK: - Unions

public enum Product {
    case productAndroid(ProductAndroid)
    case productIos(ProductIOS)
}

public enum ProductSubscription {
    case productSubscriptionAndroid(ProductSubscriptionAndroid)
    case productSubscriptionIos(ProductSubscriptionIOS)
}

public enum Purchase {
    case purchaseAndroid(PurchaseAndroid)
    case purchaseIos(PurchaseIOS)
}

public enum ReceiptValidationResult {
    case receiptValidationResultAndroid(ReceiptValidationResultAndroid)
    case receiptValidationResultIos(ReceiptValidationResultIOS)
}

// MARK: - Root Operations

/// GraphQL root mutation operations.
public protocol MutationResolver {
    /// Acknowledge a non-consumable purchase or subscription
    func acknowledgePurchaseAndroid(purchaseToken: String) async throws -> VoidResult
    /// Initiate a refund request for a product (iOS 15+)
    func beginRefundRequestIOS(sku: String) async throws -> RefundResultIOS
    /// Clear pending transactions from the StoreKit payment queue
    func clearTransactionIOS() async throws -> VoidResult
    /// Consume a purchase token so it can be repurchased
    func consumePurchaseAndroid(purchaseToken: String) async throws -> VoidResult
    /// Open the native subscription management surface
    func deepLinkToSubscriptions(options: DeepLinkOptions? = nil) async throws -> VoidResult
    /// Close the platform billing connection
    func endConnection() async throws -> Bool
    /// Finish a transaction after validating receipts
    func finishTransaction(purchase: PurchaseInput, isConsumable: Bool? = nil) async throws -> VoidResult
    /// Establish the platform billing connection
    func initConnection() async throws -> Bool
    /// Present the App Store code redemption sheet
    func presentCodeRedemptionSheetIOS() async throws -> VoidResult
    /// Initiate a purchase flow; rely on events for final state
    func requestPurchase(params: PurchaseParams) async throws -> RequestPurchaseResult?
    /// Purchase the promoted product surfaced by the App Store
    func requestPurchaseOnPromotedProductIOS() async throws -> PurchaseIOS
    /// Restore completed purchases across platforms
    func restorePurchases() async throws -> VoidResult
    /// Open subscription management UI and return changed purchases (iOS 15+)
    func showManageSubscriptionsIOS() async throws -> [PurchaseIOS]
    /// Force a StoreKit sync for transactions (iOS 15+)
    func syncIOS() async throws -> VoidResult
    /// Validate purchase receipts with the configured providers
    func validateReceipt(options: ReceiptValidationProps) async throws -> ReceiptValidationResult
}

/// GraphQL root query operations.
public protocol QueryResolver {
    /// Get current StoreKit 2 entitlements (iOS 15+)
    func currentEntitlementIOS(skus: [String]? = nil) async throws -> [EntitlementIOS]
    /// Retrieve products or subscriptions from the store
    func fetchProducts(params: ProductRequest) async throws -> FetchProductsResult
    /// Get active subscriptions (filters by subscriptionIds when provided)
    func getActiveSubscriptions(subscriptionIds: [String]? = nil) async throws -> [ActiveSubscription]
    /// Fetch the current app transaction (iOS 16+)
    func getAppTransactionIOS() async throws -> AppTransaction?
    /// Get all available purchases for the current user
    func getAvailablePurchases(options: PurchaseOptions? = nil) async throws -> [Purchase]
    /// Retrieve all pending transactions in the StoreKit queue
    func getPendingTransactionsIOS() async throws -> [PurchaseIOS]
    /// Get the currently promoted product (iOS 11+)
    func getPromotedProductIOS() async throws -> ProductIOS?
    /// Get base64-encoded receipt data for validation
    func getReceiptDataIOS() async throws -> String
    /// Get the current App Store storefront country code
    func getStorefrontIOS() async throws -> String
    /// Get the transaction JWS (StoreKit 2)
    func getTransactionJwsIOS(transactionId: String) async throws -> String
    /// Check whether the user has active subscriptions
    func hasActiveSubscriptions(subscriptionIds: [String]? = nil) async throws -> Bool
    /// Check introductory offer eligibility for specific products
    func isEligibleForIntroOfferIOS(productIds: [String]) async throws -> Bool
    /// Verify a StoreKit 2 transaction signature
    func isTransactionVerifiedIOS(transactionId: String) async throws -> Bool
    /// Get the latest transaction for a product using StoreKit 2
    func latestTransactionIOS(sku: String) async throws -> PurchaseIOS?
    /// Get StoreKit 2 subscription status details (iOS 15+)
    func subscriptionStatusIOS(skus: [String]? = nil) async throws -> [SubscriptionStatusIOS]
}

/// GraphQL root subscription operations.
public protocol SubscriptionResolver {
    /// Fires when the App Store surfaces a promoted product (iOS only)
    func promotedProductIOS() async throws -> String
    /// Fires when a purchase fails or is cancelled
    func purchaseError() async throws -> PurchaseError
    /// Fires when a purchase completes successfully or a pending purchase resolves
    func purchaseUpdated() async throws -> Purchase
}
