import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/usecases/get_public_plans_usecase.dart';
import '../../domain/usecases/get_merchant_subscription_usecase.dart';
import '../../domain/usecases/get_billing_transactions_usecase.dart';
import '../../domain/usecases/upgrade_merchant_plan_usecase.dart';
import 'subscription_event.dart';
import 'subscription_state.dart';

class SubscriptionBloc extends Bloc<SubscriptionEvent, SubscriptionState> {
  final GetPublicPlansUseCase getPublicPlansUseCase;
  final GetMerchantSubscriptionUseCase getMerchantSubscriptionUseCase;
  final GetBillingTransactionsUseCase getBillingTransactionsUseCase;
  final UpgradeMerchantPlanUseCase upgradeMerchantPlanUseCase;

  SubscriptionBloc({
    required this.getPublicPlansUseCase,
    required this.getMerchantSubscriptionUseCase,
    required this.getBillingTransactionsUseCase,
    required this.upgradeMerchantPlanUseCase,
  }) : super(SubscriptionInitial()) {
    on<LoadPublicPlansEvent>(_onLoadPublicPlans);
    on<LoadMerchantSubscriptionEvent>(_onLoadMerchantSubscription);
    on<LoadBillingTransactionsEvent>(_onLoadBillingTransactions);
    on<UpgradeMerchantPlanEvent>(_onUpgradeMerchantPlan);
  }

  Future<void> _onLoadPublicPlans(
    LoadPublicPlansEvent event,
    Emitter<SubscriptionState> emit,
  ) async {
    emit(SubscriptionLoading());

    final result = await getPublicPlansUseCase(
      status: 'ACTIVE',
      limit: 100,
      sortBy: 'displayOrder',
      sortOrder: 'asc',
    );

    result.fold(
      (failure) {
        emit(SubscriptionError(failure.message));
      },
      (plans) {
        if (state is SubscriptionLoaded) {
          emit((state as SubscriptionLoaded).copyWith(plans: plans));
        } else {
          emit(
            SubscriptionLoaded(
              plans: plans,
              subscription: null,
              transactions: const [],
            ),
          );
        }
      },
    );
  }

  Future<void> _onLoadMerchantSubscription(
    LoadMerchantSubscriptionEvent event,
    Emitter<SubscriptionState> emit,
  ) async {
    // Don't show loading if we already have data
    if (state is! SubscriptionLoaded) {
      emit(SubscriptionLoading());
    }

    final result = await getMerchantSubscriptionUseCase(event.merchantId);

    result.fold((failure) => emit(SubscriptionError(failure.message)), (
      subscription,
    ) {
      if (state is SubscriptionLoaded) {
        emit(
          (state as SubscriptionLoaded).copyWith(
            subscription: () => subscription,
          ),
        );
      } else {
        emit(
          SubscriptionLoaded(
            plans: const [],
            subscription: subscription,
            transactions: const [],
          ),
        );
      }
    });
  }

  Future<void> _onLoadBillingTransactions(
    LoadBillingTransactionsEvent event,
    Emitter<SubscriptionState> emit,
  ) async {
    // Don't show loading if we already have data
    if (state is! SubscriptionLoaded) {
      emit(SubscriptionLoading());
    }

    final result = await getBillingTransactionsUseCase(
      event.merchantId,
      limit: event.limit ?? 10,
    );

    result.fold((failure) => emit(SubscriptionError(failure.message)), (
      transactions,
    ) {
      if (state is SubscriptionLoaded) {
        emit(
          (state as SubscriptionLoaded).copyWith(transactions: transactions),
        );
      } else {
        emit(
          SubscriptionLoaded(
            plans: const [],
            subscription: null,
            transactions: transactions,
          ),
        );
      }
    });
  }

  Future<void> _onUpgradeMerchantPlan(
    UpgradeMerchantPlanEvent event,
    Emitter<SubscriptionState> emit,
  ) async {
    emit(SubscriptionUpgrading());

    final result = await upgradeMerchantPlanUseCase(
      merchantId: event.merchantId,
      planId: event.planId,
      paymentReference: event.paymentReference,
      paymentMethod: event.paymentMethod,
    );

    result.fold((failure) => emit(SubscriptionUpgradeError(failure.message)), (
      response,
    ) {
      final message =
          response['message'] as String? ?? 'Plan upgraded successfully';
      emit(SubscriptionUpgradeSuccess(message));
    });
  }
}
