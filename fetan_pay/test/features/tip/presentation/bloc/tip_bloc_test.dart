// import 'package:flutter_test/flutter_test.dart';
// import 'package:bloc_test/bloc_test.dart';
// import 'package:mockito/mockito.dart';
// import 'package:mockito/annotations.dart';
// import 'package:dartz/dartz.dart';
// import 'package:fetan_pay/core/error/failures.dart';
// import 'package:fetan_pay/features/tip/domain/usecases/get_tips_summary_usecase.dart';
// import 'package:fetan_pay/features/tip/domain/usecases/list_tips_usecase.dart';
// import 'package:fetan_pay/features/tip/presentation/bloc/tip_bloc.dart';
// import 'package:fetan_pay/features/tip/presentation/bloc/tip_event.dart';
// import 'package:fetan_pay/features/tip/presentation/bloc/tip_state.dart';
// import 'package:fetan_pay/features/tip/data/models/tip_models.dart';

// import 'tip_bloc_test.mocks.dart';

// @GenerateMocks([GetTipsSummaryUseCase, ListTipsUseCase])
// void main() {
//   late TipBloc tipBloc;
//   late MockGetTipsSummaryUseCase mockGetTipsSummaryUseCase;
//   late MockListTipsUseCase mockListTipsUseCase;

//   setUp(() {
//     mockGetTipsSummaryUseCase = MockGetTipsSummaryUseCase();
//     mockListTipsUseCase = MockListTipsUseCase();
//     tipBloc = TipBloc(
//       getTipsSummaryUseCase: mockGetTipsSummaryUseCase,
//       listTipsUseCase: mockListTipsUseCase,
//     );
//   });

//   tearDown(() {
//     tipBloc.close();
//   });

//   group('TipBloc', () {
//     const tTipsSummary = TipsSummary(count: 5, totalTipAmount: 1250.75);
//     const tTipItem = TipItem(
//       id: '1',
//       tipAmount: 50.0,
//       claimedAmount: 500.0,
//       reference: 'TXN-123456789',
//       provider: 'CBE',
//       status: 'VERIFIED',
//       createdAt: '2024-01-15T10:30:00Z',
//       verifiedAt: '2024-01-15T10:35:00Z',
//       verifiedBy: VerifiedBy(
//         id: 'user1',
//         name: 'John Doe',
//         email: 'john@example.com',
//         role: 'WAITER',
//       ),
//     );
//     const tListTipsResponse = ListTipsResponse(
//       page: 1,
//       pageSize: 20,
//       total: 1,
//       totalPages: 1,
//       data: [tTipItem],
//     );

//     test('initial state should be TipInitial', () {
//       expect(tipBloc.state, equals(const TipInitial()));
//     });

//     group('LoadTipsSummary', () {
//       const tQuery = TipsSummaryQuery();

//       blocTest<TipBloc, TipState>(
//         'should emit [TipLoaded] when getTipsSummary succeeds',
//         build: () {
//           when(
//             mockGetTipsSummaryUseCase(any),
//           ).thenAnswer((_) async => const Right(tTipsSummary));
//           return tipBloc;
//         },
//         act: (bloc) => bloc.add(const LoadTipsSummary(query: tQuery)),
//         expect: () => [
//           isA<TipLoaded>().having(
//             (state) => state.statistics.total,
//             'total tips',
//             1250.75,
//           ),
//         ],
//         verify: (_) {
//           verify(mockGetTipsSummaryUseCase(TipsSummaryParams(query: tQuery)));
//         },
//       );

//       blocTest<TipBloc, TipState>(
//         'should emit [TipError] when getTipsSummary fails',
//         build: () {
//           when(
//             mockGetTipsSummaryUseCase(any),
//           ).thenAnswer((_) async => const Left(ServerFailure('Server error')));
//           return tipBloc;
//         },
//         act: (bloc) => bloc.add(const LoadTipsSummary(query: tQuery)),
//         expect: () => [const TipError('Server error')],
//       );
//     });

//     group('LoadTipsList', () {
//       const tQuery = ListTipsQuery(page: 1, pageSize: 20);

//       blocTest<TipBloc, TipState>(
//         'should emit [TipLoaded] when listTips succeeds',
//         build: () {
//           when(
//             mockListTipsUseCase(any),
//           ).thenAnswer((_) async => const Right(tListTipsResponse));
//           return tipBloc;
//         },
//         act: (bloc) => bloc.add(const LoadTipsList(query: tQuery)),
//         expect: () => [
//           isA<TipLoaded>()
//               .having((state) => state.tips.length, 'tips count', 1)
//               .having((state) => state.tips.first.id, 'first tip id', '1'),
//         ],
//         verify: (_) {
//           verify(mockListTipsUseCase(ListTipsParams(query: tQuery)));
//         },
//       );

//       blocTest<TipBloc, TipState>(
//         'should emit [TipError] when listTips fails',
//         build: () {
//           when(
//             mockListTipsUseCase(any),
//           ).thenAnswer((_) async => const Left(NetworkFailure('No internet')));
//           return tipBloc;
//         },
//         act: (bloc) => bloc.add(const LoadTipsList(query: tQuery)),
//         expect: () => [const TipError('No internet connection')],
//       );
//     });

//     group('RefreshTips', () {
//       blocTest<TipBloc, TipState>(
//         'should emit [TipLoading, TipLoaded] when refresh succeeds',
//         build: () {
//           when(
//             mockGetTipsSummaryUseCase(any),
//           ).thenAnswer((_) async => const Right(tTipsSummary));
//           when(
//             mockListTipsUseCase(any),
//           ).thenAnswer((_) async => const Right(tListTipsResponse));
//           return tipBloc;
//         },
//         act: (bloc) => bloc.add(const RefreshTips()),
//         expect: () => [
//           const TipLoading(),
//           isA<TipLoaded>()
//               .having((state) => state.tips.length, 'tips count', 1)
//               .having(
//                 (state) => state.statistics.total,
//                 'total amount',
//                 1250.75,
//               ),
//         ],
//         verify: (_) {
//           // Should call multiple summary endpoints and tips list
//           verify(
//             mockGetTipsSummaryUseCase(any),
//           ).called(4); // today, week, month, total
//           verify(mockListTipsUseCase(any)).called(1);
//         },
//       );

//       blocTest<TipBloc, TipState>(
//         'should emit [TipLoading, TipError] when refresh fails',
//         build: () {
//           when(
//             mockGetTipsSummaryUseCase(any),
//           ).thenAnswer((_) async => const Left(ServerFailure('Server error')));
//           return tipBloc;
//         },
//         act: (bloc) => bloc.add(const RefreshTips()),
//         expect: () => [const TipLoading(), const TipError('Server error')],
//       );
//     });

//     group('LoadMoreTips', () {
//       const tInitialState = TipLoaded(
//         statistics: TipStatistics(
//           today: 100.0,
//           thisWeek: 500.0,
//           thisMonth: 1000.0,
//           total: 2000.0,
//         ),
//         tips: [tTipItem],
//         currentPage: 1,
//         hasReachedMax: false,
//       );

//       const tNewTipItem = TipItem(
//         id: '2',
//         tipAmount: 75.0,
//         claimedAmount: 750.0,
//         reference: 'TXN-987654321',
//         provider: 'BOA',
//         status: 'VERIFIED',
//         createdAt: '2024-01-14T15:20:00Z',
//         verifiedAt: '2024-01-14T15:25:00Z',
//       );

//       const tMoreTipsResponse = ListTipsResponse(
//         page: 2,
//         pageSize: 20,
//         total: 2,
//         totalPages: 1,
//         data: [tNewTipItem],
//       );

//       blocTest<TipBloc, TipState>(
//         'should load more tips and append to existing list',
//         build: () {
//           when(
//             mockListTipsUseCase(any),
//           ).thenAnswer((_) async => const Right(tMoreTipsResponse));
//           return tipBloc;
//         },
//         seed: () => tInitialState,
//         act: (bloc) => bloc.add(const LoadMoreTips()),
//         expect: () => [
//           tInitialState.copyWith(isLoadingMore: true),
//           isA<TipLoaded>()
//               .having((state) => state.tips.length, 'tips count', 2)
//               .having((state) => state.currentPage, 'current page', 2)
//               .having((state) => state.isLoadingMore, 'is loading more', false),
//         ],
//       );

//       blocTest<TipBloc, TipState>(
//         'should not load more tips when hasReachedMax is true',
//         build: () => tipBloc,
//         seed: () => tInitialState.copyWith(hasReachedMax: true),
//         act: (bloc) => bloc.add(const LoadMoreTips()),
//         expect: () => [],
//         verify: (_) {
//           verifyNever(mockListTipsUseCase(any));
//         },
//       );

//       blocTest<TipBloc, TipState>(
//         'should not load more tips when already loading more',
//         build: () => tipBloc,
//         seed: () => tInitialState.copyWith(isLoadingMore: true),
//         act: (bloc) => bloc.add(const LoadMoreTips()),
//         expect: () => [],
//         verify: (_) {
//           verifyNever(mockListTipsUseCase(any));
//         },
//       );
//     });
//   });
// }
