// ============================================================================
// AUTO-GENERATED TYPES — DO NOT EDIT DIRECTLY
// Run `npm run generate` after updating any *.graphql schema file.
// ============================================================================

// ignore_for_file: unused_element, unused_field

import 'dart:async';

// MARK: - Enums

enum ErrorCode {
  unknown('UNKNOWN'),
  userCancelled('USER_CANCELLED'),
  userError('USER_ERROR'),
  itemUnavailable('ITEM_UNAVAILABLE'),
  remoteError('REMOTE_ERROR'),
  networkError('NETWORK_ERROR'),
  serviceError('SERVICE_ERROR'),
  receiptFailed('RECEIPT_FAILED'),
  receiptFinished('RECEIPT_FINISHED'),
  receiptFinishedFailed('RECEIPT_FINISHED_FAILED'),
  notPrepared('NOT_PREPARED'),
  notEnded('NOT_ENDED'),
  alreadyOwned('ALREADY_OWNED'),
  developerError('DEVELOPER_ERROR'),
  billingResponseJsonParseError('BILLING_RESPONSE_JSON_PARSE_ERROR'),
  deferredPayment('DEFERRED_PAYMENT'),
  interrupted('INTERRUPTED'),
  iapNotAvailable('IAP_NOT_AVAILABLE'),
  purchaseError('PURCHASE_ERROR'),
  syncError('SYNC_ERROR'),
  transactionValidationFailed('TRANSACTION_VALIDATION_FAILED'),
  activityUnavailable('ACTIVITY_UNAVAILABLE'),
  alreadyPrepared('ALREADY_PREPARED'),
  pending('PENDING'),
  connectionClosed('CONNECTION_CLOSED'),
  initConnection('INIT_CONNECTION'),
  serviceDisconnected('SERVICE_DISCONNECTED'),
  queryProduct('QUERY_PRODUCT'),
  skuNotFound('SKU_NOT_FOUND'),
  skuOfferMismatch('SKU_OFFER_MISMATCH'),
  itemNotOwned('ITEM_NOT_OWNED'),
  billingUnavailable('BILLING_UNAVAILABLE'),
  featureNotSupported('FEATURE_NOT_SUPPORTED'),
  emptySkuList('EMPTY_SKU_LIST');

  const ErrorCode(this.value);
  final String value;
}

enum IapEvent {
  purchaseUpdated('PURCHASE_UPDATED'),
  purchaseError('PURCHASE_ERROR'),
  promotedProductIos('PROMOTED_PRODUCT_IOS');

  const IapEvent(this.value);
  final String value;
}

enum PaymentModeIOS {
  empty('EMPTY'),
  freeTrial('FREE_TRIAL'),
  payAsYouGo('PAY_AS_YOU_GO'),
  payUpFront('PAY_UP_FRONT');

  const PaymentModeIOS(this.value);
  final String value;
}

enum Platform {
  ios('IOS'),
  android('ANDROID');

  const Platform(this.value);
  final String value;
}

enum ProductQueryType {
  inApp('IN_APP'),
  subs('SUBS'),
  all('ALL');

  const ProductQueryType(this.value);
  final String value;
}

enum ProductType {
  inApp('IN_APP'),
  subs('SUBS');

  const ProductType(this.value);
  final String value;
}

enum ProductTypeIOS {
  consumable('CONSUMABLE'),
  nonConsumable('NON_CONSUMABLE'),
  autoRenewableSubscription('AUTO_RENEWABLE_SUBSCRIPTION'),
  nonRenewingSubscription('NON_RENEWING_SUBSCRIPTION');

  const ProductTypeIOS(this.value);
  final String value;
}

enum PurchaseState {
  pending('PENDING'),
  purchased('PURCHASED'),
  failed('FAILED'),
  restored('RESTORED'),
  deferred('DEFERRED'),
  unknown('UNKNOWN');

  const PurchaseState(this.value);
  final String value;
}

enum SubscriptionOfferTypeIOS {
  introductory('INTRODUCTORY'),
  promotional('PROMOTIONAL');

  const SubscriptionOfferTypeIOS(this.value);
  final String value;
}

enum SubscriptionPeriodIOS {
  day('DAY'),
  week('WEEK'),
  month('MONTH'),
  year('YEAR'),
  empty('EMPTY');

  const SubscriptionPeriodIOS(this.value);
  final String value;
}

// MARK: - Interfaces

abstract class ProductCommon {
  String get currency;
  String? get debugDescription;
  String get description;
  String? get displayName;
  String get displayPrice;
  String get id;
  Platform get platform;
  double? get price;
  String get title;
  ProductType get type;
}

abstract class PurchaseCommon {
  String get id;
  List<String>? get ids;
  bool get isAutoRenewing;
  Platform get platform;
  String get productId;
  PurchaseState get purchaseState;
  /// Unified purchase token (iOS JWS, Android purchaseToken)
  String? get purchaseToken;
  int get quantity;
  double get transactionDate;
}

// MARK: - Objects

class ActiveSubscription {
  const ActiveSubscription({
    this.autoRenewingAndroid,
    this.daysUntilExpirationIOS,
    this.environmentIOS,
    this.expirationDateIOS,
    required this.isActive,
    required this.productId,
    this.purchaseToken,
    required this.transactionDate,
    required this.transactionId,
    this.willExpireSoon,
  });

  final bool? autoRenewingAndroid;
  final double? daysUntilExpirationIOS;
  final String? environmentIOS;
  final double? expirationDateIOS;
  final bool isActive;
  final String productId;
  final String? purchaseToken;
  final double transactionDate;
  final String transactionId;
  final bool? willExpireSoon;
}

class AppTransaction {
  const AppTransaction({
    required this.appId,
    this.appTransactionId,
    required this.appVersion,
    required this.appVersionId,
    required this.bundleId,
    required this.deviceVerification,
    required this.deviceVerificationNonce,
    required this.environment,
    required this.originalAppVersion,
    this.originalPlatform,
    required this.originalPurchaseDate,
    this.preorderDate,
    required this.signedDate,
  });

  final double appId;
  final String? appTransactionId;
  final String appVersion;
  final double appVersionId;
  final String bundleId;
  final String deviceVerification;
  final String deviceVerificationNonce;
  final String environment;
  final String originalAppVersion;
  final String? originalPlatform;
  final double originalPurchaseDate;
  final double? preorderDate;
  final double signedDate;
}

class DiscountIOS {
  const DiscountIOS({
    required this.identifier,
    this.localizedPrice,
    required this.numberOfPeriods,
    required this.paymentMode,
    required this.price,
    required this.priceAmount,
    required this.subscriptionPeriod,
    required this.type,
  });

  final String identifier;
  final String? localizedPrice;
  final int numberOfPeriods;
  final PaymentModeIOS paymentMode;
  final String price;
  final double priceAmount;
  final String subscriptionPeriod;
  final String type;
}

class DiscountOfferIOS {
  const DiscountOfferIOS({
    /// Discount identifier
    required this.identifier,
    /// Key identifier for validation
    required this.keyIdentifier,
    /// Cryptographic nonce
    required this.nonce,
    /// Signature for validation
    required this.signature,
    /// Timestamp of discount offer
    required this.timestamp,
  });

  /// Discount identifier
  final String identifier;
  /// Key identifier for validation
  final String keyIdentifier;
  /// Cryptographic nonce
  final String nonce;
  /// Signature for validation
  final String signature;
  /// Timestamp of discount offer
  final double timestamp;
}

class EntitlementIOS {
  const EntitlementIOS({
    required this.jsonRepresentation,
    required this.sku,
    required this.transactionId,
  });

  final String jsonRepresentation;
  final String sku;
  final String transactionId;
}

class FetchProductsResult {
  const FetchProductsResult({
    this.products,
    this.subscriptions,
  });

  final List<Product>? products;
  final List<ProductSubscription>? subscriptions;
}

class PricingPhaseAndroid {
  const PricingPhaseAndroid({
    required this.billingCycleCount,
    required this.billingPeriod,
    required this.formattedPrice,
    required this.priceAmountMicros,
    required this.priceCurrencyCode,
    required this.recurrenceMode,
  });

  final int billingCycleCount;
  final String billingPeriod;
  final String formattedPrice;
  final String priceAmountMicros;
  final String priceCurrencyCode;
  final int recurrenceMode;
}

class PricingPhasesAndroid {
  const PricingPhasesAndroid({
    required this.pricingPhaseList,
  });

  final List<PricingPhaseAndroid> pricingPhaseList;
}

class ProductAndroid implements ProductCommon, Product {
  const ProductAndroid({
    required this.currency,
    this.debugDescription,
    required this.description,
    this.displayName,
    required this.displayPrice,
    required this.id,
    required this.nameAndroid,
    this.oneTimePurchaseOfferDetailsAndroid,
    required this.platform,
    this.price,
    this.subscriptionOfferDetailsAndroid,
    required this.title,
    required this.type,
  });

  final String currency;
  final String? debugDescription;
  final String description;
  final String? displayName;
  final String displayPrice;
  final String id;
  final String nameAndroid;
  final ProductAndroidOneTimePurchaseOfferDetail? oneTimePurchaseOfferDetailsAndroid;
  final Platform platform;
  final double? price;
  final List<ProductSubscriptionAndroidOfferDetails>? subscriptionOfferDetailsAndroid;
  final String title;
  final ProductType type;
}

class ProductAndroidOneTimePurchaseOfferDetail {
  const ProductAndroidOneTimePurchaseOfferDetail({
    required this.formattedPrice,
    required this.priceAmountMicros,
    required this.priceCurrencyCode,
  });

  final String formattedPrice;
  final String priceAmountMicros;
  final String priceCurrencyCode;
}

class ProductIOS implements ProductCommon, Product {
  const ProductIOS({
    required this.currency,
    this.debugDescription,
    required this.description,
    this.displayName,
    required this.displayNameIOS,
    required this.displayPrice,
    required this.id,
    required this.isFamilyShareableIOS,
    required this.jsonRepresentationIOS,
    required this.platform,
    this.price,
    this.subscriptionInfoIOS,
    required this.title,
    required this.type,
    required this.typeIOS,
  });

  final String currency;
  final String? debugDescription;
  final String description;
  final String? displayName;
  final String displayNameIOS;
  final String displayPrice;
  final String id;
  final bool isFamilyShareableIOS;
  final String jsonRepresentationIOS;
  final Platform platform;
  final double? price;
  final SubscriptionInfoIOS? subscriptionInfoIOS;
  final String title;
  final ProductType type;
  final ProductTypeIOS typeIOS;
}

class ProductSubscriptionAndroid implements ProductCommon, ProductSubscription {
  const ProductSubscriptionAndroid({
    required this.currency,
    this.debugDescription,
    required this.description,
    this.displayName,
    required this.displayPrice,
    required this.id,
    required this.nameAndroid,
    this.oneTimePurchaseOfferDetailsAndroid,
    required this.platform,
    this.price,
    required this.subscriptionOfferDetailsAndroid,
    required this.title,
    required this.type,
  });

  final String currency;
  final String? debugDescription;
  final String description;
  final String? displayName;
  final String displayPrice;
  final String id;
  final String nameAndroid;
  final ProductAndroidOneTimePurchaseOfferDetail? oneTimePurchaseOfferDetailsAndroid;
  final Platform platform;
  final double? price;
  final List<ProductSubscriptionAndroidOfferDetails> subscriptionOfferDetailsAndroid;
  final String title;
  final ProductType type;
}

class ProductSubscriptionAndroidOfferDetails {
  const ProductSubscriptionAndroidOfferDetails({
    required this.basePlanId,
    this.offerId,
    required this.offerTags,
    required this.offerToken,
    required this.pricingPhases,
  });

  final String basePlanId;
  final String? offerId;
  final List<String> offerTags;
  final String offerToken;
  final PricingPhasesAndroid pricingPhases;
}

class ProductSubscriptionIOS implements ProductCommon, ProductSubscription {
  const ProductSubscriptionIOS({
    required this.currency,
    this.debugDescription,
    required this.description,
    this.discountsIOS,
    this.displayName,
    required this.displayNameIOS,
    required this.displayPrice,
    required this.id,
    this.introductoryPriceAsAmountIOS,
    this.introductoryPriceIOS,
    this.introductoryPriceNumberOfPeriodsIOS,
    this.introductoryPricePaymentModeIOS,
    this.introductoryPriceSubscriptionPeriodIOS,
    required this.isFamilyShareableIOS,
    required this.jsonRepresentationIOS,
    required this.platform,
    this.price,
    this.subscriptionInfoIOS,
    this.subscriptionPeriodNumberIOS,
    this.subscriptionPeriodUnitIOS,
    required this.title,
    required this.type,
    required this.typeIOS,
  });

  final String currency;
  final String? debugDescription;
  final String description;
  final List<DiscountIOS>? discountsIOS;
  final String? displayName;
  final String displayNameIOS;
  final String displayPrice;
  final String id;
  final String? introductoryPriceAsAmountIOS;
  final String? introductoryPriceIOS;
  final String? introductoryPriceNumberOfPeriodsIOS;
  final PaymentModeIOS? introductoryPricePaymentModeIOS;
  final SubscriptionPeriodIOS? introductoryPriceSubscriptionPeriodIOS;
  final bool isFamilyShareableIOS;
  final String jsonRepresentationIOS;
  final Platform platform;
  final double? price;
  final SubscriptionInfoIOS? subscriptionInfoIOS;
  final String? subscriptionPeriodNumberIOS;
  final SubscriptionPeriodIOS? subscriptionPeriodUnitIOS;
  final String title;
  final ProductType type;
  final ProductTypeIOS typeIOS;
}

class PurchaseAndroid implements PurchaseCommon, Purchase {
  const PurchaseAndroid({
    this.autoRenewingAndroid,
    this.dataAndroid,
    this.developerPayloadAndroid,
    required this.id,
    this.ids,
    this.isAcknowledgedAndroid,
    required this.isAutoRenewing,
    this.obfuscatedAccountIdAndroid,
    this.obfuscatedProfileIdAndroid,
    this.packageNameAndroid,
    required this.platform,
    required this.productId,
    required this.purchaseState,
    this.purchaseToken,
    required this.quantity,
    this.signatureAndroid,
    required this.transactionDate,
  });

  final bool? autoRenewingAndroid;
  final String? dataAndroid;
  final String? developerPayloadAndroid;
  final String id;
  final List<String>? ids;
  final bool? isAcknowledgedAndroid;
  final bool isAutoRenewing;
  final String? obfuscatedAccountIdAndroid;
  final String? obfuscatedProfileIdAndroid;
  final String? packageNameAndroid;
  final Platform platform;
  final String productId;
  final PurchaseState purchaseState;
  final String? purchaseToken;
  final int quantity;
  final String? signatureAndroid;
  final double transactionDate;
}

class PurchaseError {
  const PurchaseError({
    required this.code,
    required this.message,
    this.productId,
  });

  final ErrorCode code;
  final String message;
  final String? productId;
}

class PurchaseIOS implements PurchaseCommon, Purchase {
  const PurchaseIOS({
    this.appAccountToken,
    this.appBundleIdIOS,
    this.countryCodeIOS,
    this.currencyCodeIOS,
    this.currencySymbolIOS,
    this.environmentIOS,
    this.expirationDateIOS,
    required this.id,
    this.ids,
    required this.isAutoRenewing,
    this.isUpgradedIOS,
    this.offerIOS,
    this.originalTransactionDateIOS,
    this.originalTransactionIdentifierIOS,
    this.ownershipTypeIOS,
    required this.platform,
    required this.productId,
    required this.purchaseState,
    this.purchaseToken,
    required this.quantity,
    this.quantityIOS,
    this.reasonIOS,
    this.reasonStringRepresentationIOS,
    this.revocationDateIOS,
    this.revocationReasonIOS,
    this.storefrontCountryCodeIOS,
    this.subscriptionGroupIdIOS,
    required this.transactionDate,
    this.transactionReasonIOS,
    this.webOrderLineItemIdIOS,
  });

  final String? appAccountToken;
  final String? appBundleIdIOS;
  final String? countryCodeIOS;
  final String? currencyCodeIOS;
  final String? currencySymbolIOS;
  final String? environmentIOS;
  final double? expirationDateIOS;
  final String id;
  final List<String>? ids;
  final bool isAutoRenewing;
  final bool? isUpgradedIOS;
  final PurchaseOfferIOS? offerIOS;
  final double? originalTransactionDateIOS;
  final String? originalTransactionIdentifierIOS;
  final String? ownershipTypeIOS;
  final Platform platform;
  final String productId;
  final PurchaseState purchaseState;
  final String? purchaseToken;
  final int quantity;
  final int? quantityIOS;
  final String? reasonIOS;
  final String? reasonStringRepresentationIOS;
  final double? revocationDateIOS;
  final String? revocationReasonIOS;
  final String? storefrontCountryCodeIOS;
  final String? subscriptionGroupIdIOS;
  final double transactionDate;
  final String? transactionReasonIOS;
  final String? webOrderLineItemIdIOS;
}

class PurchaseOfferIOS {
  const PurchaseOfferIOS({
    required this.id,
    required this.paymentMode,
    required this.type,
  });

  final String id;
  final String paymentMode;
  final String type;
}

class ReceiptValidationResultAndroid implements ReceiptValidationResult {
  const ReceiptValidationResultAndroid({
    required this.autoRenewing,
    required this.betaProduct,
    this.cancelDate,
    this.cancelReason,
    this.deferredDate,
    this.deferredSku,
    required this.freeTrialEndDate,
    required this.gracePeriodEndDate,
    required this.parentProductId,
    required this.productId,
    required this.productType,
    required this.purchaseDate,
    required this.quantity,
    required this.receiptId,
    required this.renewalDate,
    required this.term,
    required this.termSku,
    required this.testTransaction,
  });

  final bool autoRenewing;
  final bool betaProduct;
  final double? cancelDate;
  final String? cancelReason;
  final double? deferredDate;
  final double? deferredSku;
  final double freeTrialEndDate;
  final double gracePeriodEndDate;
  final String parentProductId;
  final String productId;
  final String productType;
  final double purchaseDate;
  final int quantity;
  final String receiptId;
  final double renewalDate;
  final String term;
  final String termSku;
  final bool testTransaction;
}

class ReceiptValidationResultIOS implements ReceiptValidationResult {
  const ReceiptValidationResultIOS({
    /// Whether the receipt is valid
    required this.isValid,
    /// JWS representation
    required this.jwsRepresentation,
    /// Latest transaction if available
    this.latestTransaction,
    /// Receipt data string
    required this.receiptData,
  });

  /// Whether the receipt is valid
  final bool isValid;
  /// JWS representation
  final String jwsRepresentation;
  /// Latest transaction if available
  final Purchase? latestTransaction;
  /// Receipt data string
  final String receiptData;
}

class RefundResultIOS {
  const RefundResultIOS({
    this.message,
    required this.status,
  });

  final String? message;
  final String status;
}

class RenewalInfoIOS {
  const RenewalInfoIOS({
    this.autoRenewPreference,
    this.jsonRepresentation,
    required this.willAutoRenew,
  });

  final String? autoRenewPreference;
  final String? jsonRepresentation;
  final bool willAutoRenew;
}

class RequestPurchaseResult {
  const RequestPurchaseResult({
    this.purchase,
    this.purchases,
  });

  final Purchase? purchase;
  final List<Purchase>? purchases;
}

class SubscriptionInfoIOS {
  const SubscriptionInfoIOS({
    this.introductoryOffer,
    this.promotionalOffers,
    required this.subscriptionGroupId,
    required this.subscriptionPeriod,
  });

  final SubscriptionOfferIOS? introductoryOffer;
  final List<SubscriptionOfferIOS>? promotionalOffers;
  final String subscriptionGroupId;
  final SubscriptionPeriodValueIOS subscriptionPeriod;
}

class SubscriptionOfferIOS {
  const SubscriptionOfferIOS({
    required this.displayPrice,
    required this.id,
    required this.paymentMode,
    required this.period,
    required this.periodCount,
    required this.price,
    required this.type,
  });

  final String displayPrice;
  final String id;
  final PaymentModeIOS paymentMode;
  final SubscriptionPeriodValueIOS period;
  final int periodCount;
  final double price;
  final SubscriptionOfferTypeIOS type;
}

class SubscriptionPeriodValueIOS {
  const SubscriptionPeriodValueIOS({
    required this.unit,
    required this.value,
  });

  final SubscriptionPeriodIOS unit;
  final int value;
}

class SubscriptionStatusIOS {
  const SubscriptionStatusIOS({
    this.renewalInfo,
    required this.state,
  });

  final RenewalInfoIOS? renewalInfo;
  final String state;
}

class VoidResult {
  const VoidResult({
    required this.success,
  });

  final bool success;
}

// MARK: - Input Objects

class AndroidSubscriptionOfferInput {
  const AndroidSubscriptionOfferInput({
    /// Offer token
    required this.offerToken,
    /// Product SKU
    required this.sku,
  });

  /// Offer token
  final String offerToken;
  /// Product SKU
  final String sku;
}

class DeepLinkOptions {
  const DeepLinkOptions({
    /// Android package name to target (required on Android)
    this.packageNameAndroid,
    /// Android SKU to open (required on Android)
    this.skuAndroid,
  });

  /// Android package name to target (required on Android)
  final String? packageNameAndroid;
  /// Android SKU to open (required on Android)
  final String? skuAndroid;
}

class DiscountOfferInputIOS {
  const DiscountOfferInputIOS({
    /// Discount identifier
    required this.identifier,
    /// Key identifier for validation
    required this.keyIdentifier,
    /// Cryptographic nonce
    required this.nonce,
    /// Signature for validation
    required this.signature,
    /// Timestamp of discount offer
    required this.timestamp,
  });

  /// Discount identifier
  final String identifier;
  /// Key identifier for validation
  final String keyIdentifier;
  /// Cryptographic nonce
  final String nonce;
  /// Signature for validation
  final String signature;
  /// Timestamp of discount offer
  final double timestamp;
}

class ProductRequest {
  const ProductRequest({
    required this.skus,
    this.type,
  });

  final List<String> skus;
  final ProductQueryType? type;
}

class PurchaseInput {
  const PurchaseInput({
    required this.id,
    this.ids,
    required this.isAutoRenewing,
    required this.platform,
    required this.productId,
    required this.purchaseState,
    this.purchaseToken,
    required this.quantity,
    required this.transactionDate,
  });

  final String id;
  final List<String>? ids;
  final bool isAutoRenewing;
  final Platform platform;
  final String productId;
  final PurchaseState purchaseState;
  final String? purchaseToken;
  final int quantity;
  final double transactionDate;
}

class PurchaseOptions {
  const PurchaseOptions({
    /// Also emit results through the iOS event listeners
    this.alsoPublishToEventListenerIOS,
    /// Limit to currently active items on iOS
    this.onlyIncludeActiveItemsIOS,
  });

  /// Also emit results through the iOS event listeners
  final bool? alsoPublishToEventListenerIOS;
  /// Limit to currently active items on iOS
  final bool? onlyIncludeActiveItemsIOS;
}

class PurchaseParams {
  const PurchaseParams({
    /// Per-platform purchase request props
    this.requestPurchase,
    /// Per-platform subscription request props
    this.requestSubscription,
    /// Explicit purchase type hint (defaults to in-app)
    this.type,
  });

  /// Per-platform purchase request props
  final RequestPurchasePropsByPlatforms? requestPurchase;
  /// Per-platform subscription request props
  final RequestSubscriptionPropsByPlatforms? requestSubscription;
  /// Explicit purchase type hint (defaults to in-app)
  final ProductQueryType? type;
}

class ReceiptValidationAndroidOptions {
  const ReceiptValidationAndroidOptions({
    required this.accessToken,
    this.isSub,
    required this.packageName,
    required this.productToken,
  });

  final String accessToken;
  final bool? isSub;
  final String packageName;
  final String productToken;
}

class ReceiptValidationProps {
  const ReceiptValidationProps({
    /// Android-specific validation options
    this.androidOptions,
    /// Product SKU to validate
    required this.sku,
  });

  /// Android-specific validation options
  final ReceiptValidationAndroidOptions? androidOptions;
  /// Product SKU to validate
  final String sku;
}

class RequestPurchaseAndroidProps {
  const RequestPurchaseAndroidProps({
    /// Personalized offer flag
    this.isOfferPersonalized,
    /// Obfuscated account ID
    this.obfuscatedAccountIdAndroid,
    /// Obfuscated profile ID
    this.obfuscatedProfileIdAndroid,
    /// List of product SKUs
    required this.skus,
  });

  /// Personalized offer flag
  final bool? isOfferPersonalized;
  /// Obfuscated account ID
  final String? obfuscatedAccountIdAndroid;
  /// Obfuscated profile ID
  final String? obfuscatedProfileIdAndroid;
  /// List of product SKUs
  final List<String> skus;
}

class RequestPurchaseIosProps {
  const RequestPurchaseIosProps({
    /// Auto-finish transaction (dangerous)
    this.andDangerouslyFinishTransactionAutomatically,
    /// App account token for user tracking
    this.appAccountToken,
    /// Purchase quantity
    this.quantity,
    /// Product SKU
    required this.sku,
    /// Discount offer to apply
    this.withOffer,
  });

  /// Auto-finish transaction (dangerous)
  final bool? andDangerouslyFinishTransactionAutomatically;
  /// App account token for user tracking
  final String? appAccountToken;
  /// Purchase quantity
  final int? quantity;
  /// Product SKU
  final String sku;
  /// Discount offer to apply
  final DiscountOfferInputIOS? withOffer;
}

class RequestPurchaseProps {
  const RequestPurchaseProps({
    /// Android-specific purchase parameters
    this.android,
    /// iOS-specific purchase parameters
    this.ios,
  });

  /// Android-specific purchase parameters
  final RequestPurchaseAndroidProps? android;
  /// iOS-specific purchase parameters
  final RequestPurchaseIosProps? ios;
}

class RequestPurchasePropsByPlatforms {
  const RequestPurchasePropsByPlatforms({
    /// Android-specific purchase parameters
    this.android,
    /// iOS-specific purchase parameters
    this.ios,
  });

  /// Android-specific purchase parameters
  final RequestPurchaseAndroidProps? android;
  /// iOS-specific purchase parameters
  final RequestPurchaseIosProps? ios;
}

class RequestSubscriptionAndroidProps {
  const RequestSubscriptionAndroidProps({
    /// Personalized offer flag
    this.isOfferPersonalized,
    /// Obfuscated account ID
    this.obfuscatedAccountIdAndroid,
    /// Obfuscated profile ID
    this.obfuscatedProfileIdAndroid,
    /// Purchase token for upgrades/downgrades
    this.purchaseTokenAndroid,
    /// Replacement mode for subscription changes
    this.replacementModeAndroid,
    /// List of subscription SKUs
    required this.skus,
    /// Subscription offers
    this.subscriptionOffers,
  });

  /// Personalized offer flag
  final bool? isOfferPersonalized;
  /// Obfuscated account ID
  final String? obfuscatedAccountIdAndroid;
  /// Obfuscated profile ID
  final String? obfuscatedProfileIdAndroid;
  /// Purchase token for upgrades/downgrades
  final String? purchaseTokenAndroid;
  /// Replacement mode for subscription changes
  final int? replacementModeAndroid;
  /// List of subscription SKUs
  final List<String> skus;
  /// Subscription offers
  final List<AndroidSubscriptionOfferInput>? subscriptionOffers;
}

class RequestSubscriptionIosProps {
  const RequestSubscriptionIosProps({
    this.andDangerouslyFinishTransactionAutomatically,
    this.appAccountToken,
    this.quantity,
    required this.sku,
    this.withOffer,
  });

  final bool? andDangerouslyFinishTransactionAutomatically;
  final String? appAccountToken;
  final int? quantity;
  final String sku;
  final DiscountOfferInputIOS? withOffer;
}

class RequestSubscriptionPropsByPlatforms {
  const RequestSubscriptionPropsByPlatforms({
    /// Android-specific subscription parameters
    this.android,
    /// iOS-specific subscription parameters
    this.ios,
  });

  /// Android-specific subscription parameters
  final RequestSubscriptionAndroidProps? android;
  /// iOS-specific subscription parameters
  final RequestPurchaseIosProps? ios;
}

// MARK: - Unions

abstract class Product {}

abstract class ProductSubscription {}

abstract class Purchase {}

abstract class ReceiptValidationResult {}

// MARK: - Root Operations

/// GraphQL root mutation operations.
abstract class MutationResolver {
  /// Acknowledge a non-consumable purchase or subscription
  Future<VoidResult> acknowledgePurchaseAndroid({
    required String purchaseToken,
  });
  /// Initiate a refund request for a product (iOS 15+)
  Future<RefundResultIOS> beginRefundRequestIOS({
    required String sku,
  });
  /// Clear pending transactions from the StoreKit payment queue
  Future<VoidResult> clearTransactionIOS();
  /// Consume a purchase token so it can be repurchased
  Future<VoidResult> consumePurchaseAndroid({
    required String purchaseToken,
  });
  /// Open the native subscription management surface
  Future<VoidResult> deepLinkToSubscriptions({
    DeepLinkOptions? options,
  });
  /// Close the platform billing connection
  Future<bool> endConnection();
  /// Finish a transaction after validating receipts
  Future<VoidResult> finishTransaction({
    required PurchaseInput purchase,
    bool? isConsumable,
  });
  /// Establish the platform billing connection
  Future<bool> initConnection();
  /// Present the App Store code redemption sheet
  Future<VoidResult> presentCodeRedemptionSheetIOS();
  /// Initiate a purchase flow; rely on events for final state
  Future<RequestPurchaseResult?> requestPurchase({
    required PurchaseParams params,
  });
  /// Purchase the promoted product surfaced by the App Store
  Future<PurchaseIOS> requestPurchaseOnPromotedProductIOS();
  /// Restore completed purchases across platforms
  Future<VoidResult> restorePurchases();
  /// Open subscription management UI and return changed purchases (iOS 15+)
  Future<List<PurchaseIOS>> showManageSubscriptionsIOS();
  /// Force a StoreKit sync for transactions (iOS 15+)
  Future<VoidResult> syncIOS();
  /// Validate purchase receipts with the configured providers
  Future<ReceiptValidationResult> validateReceipt({
    required ReceiptValidationProps options,
  });
}

/// GraphQL root query operations.
abstract class QueryResolver {
  /// Get current StoreKit 2 entitlements (iOS 15+)
  Future<List<EntitlementIOS>> currentEntitlementIOS({
    List<String>? skus,
  });
  /// Retrieve products or subscriptions from the store
  Future<FetchProductsResult> fetchProducts({
    required ProductRequest params,
  });
  /// Get active subscriptions (filters by subscriptionIds when provided)
  Future<List<ActiveSubscription>> getActiveSubscriptions({
    List<String>? subscriptionIds,
  });
  /// Fetch the current app transaction (iOS 16+)
  Future<AppTransaction?> getAppTransactionIOS();
  /// Get all available purchases for the current user
  Future<List<Purchase>> getAvailablePurchases({
    PurchaseOptions? options,
  });
  /// Retrieve all pending transactions in the StoreKit queue
  Future<List<PurchaseIOS>> getPendingTransactionsIOS();
  /// Get the currently promoted product (iOS 11+)
  Future<ProductIOS?> getPromotedProductIOS();
  /// Get base64-encoded receipt data for validation
  Future<String> getReceiptDataIOS();
  /// Get the current App Store storefront country code
  Future<String> getStorefrontIOS();
  /// Get the transaction JWS (StoreKit 2)
  Future<String> getTransactionJwsIOS({
    required String transactionId,
  });
  /// Check whether the user has active subscriptions
  Future<bool> hasActiveSubscriptions({
    List<String>? subscriptionIds,
  });
  /// Check introductory offer eligibility for specific products
  Future<bool> isEligibleForIntroOfferIOS({
    required List<String> productIds,
  });
  /// Verify a StoreKit 2 transaction signature
  Future<bool> isTransactionVerifiedIOS({
    required String transactionId,
  });
  /// Get the latest transaction for a product using StoreKit 2
  Future<PurchaseIOS?> latestTransactionIOS({
    required String sku,
  });
  /// Get StoreKit 2 subscription status details (iOS 15+)
  Future<List<SubscriptionStatusIOS>> subscriptionStatusIOS({
    List<String>? skus,
  });
}

/// GraphQL root subscription operations.
abstract class SubscriptionResolver {
  /// Fires when the App Store surfaces a promoted product (iOS only)
  Future<String> promotedProductIOS();
  /// Fires when a purchase fails or is cancelled
  Future<PurchaseError> purchaseError();
  /// Fires when a purchase completes successfully or a pending purchase resolves
  Future<Purchase> purchaseUpdated();
}
