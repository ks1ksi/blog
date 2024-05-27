declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"blog": {
"1. 아키텍팅.md": {
	id: "1. 아키텍팅.md";
  slug: "1-아키텍팅";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"10. 네트워킹 2.md": {
	id: "10. 네트워킹 2.md";
  slug: "10-네트워킹-2";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"11. 서버리스.md": {
	id: "11. 서버리스.md";
  slug: "11-서버리스";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"12. 엣지 서비스.md": {
	id: "12. 엣지 서비스.md";
  slug: "12-엣지-서비스";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"13. 백업 및 복구.md": {
	id: "13. 백업 및 복구.md";
  slug: "13-백업-및-복구";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2. 계정 보안.md": {
	id: "2. 계정 보안.md";
  slug: "2-계정-보안";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2022 SKKU 프로그래밍 대회 in 소프트의 밤.md": {
	id: "2022 SKKU 프로그래밍 대회 in 소프트의 밤.md";
  slug: "2022-skku-프로그래밍-대회-in-소프트의-밤";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2022 성균관대학교 프로그래밍 경진대회.md": {
	id: "2022 성균관대학교 프로그래밍 경진대회.md";
  slug: "2022-성균관대학교-프로그래밍-경진대회";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023 SKKU AI 교육 해커톤 후기.md": {
	id: "2023 SKKU AI 교육 해커톤 후기.md";
  slug: "2023-skku-ai-교육-해커톤-후기";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023 새해 목표.md": {
	id: "2023 새해 목표.md";
  slug: "2023-새해-목표";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2023 회고.md": {
	id: "2023 회고.md";
  slug: "2023-회고";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2024 LG CNS 채용연계형 인턴 지원 및 합격 후기.md": {
	id: "2024 LG CNS 채용연계형 인턴 지원 및 합격 후기.md";
  slug: "2024-lg-cns-채용연계형-인턴-지원-및-합격-후기";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2024 LG CNS 채용연계형 인턴 최종 전환 후기.md": {
	id: "2024 LG CNS 채용연계형 인턴 최종 전환 후기.md";
  slug: "2024-lg-cns-채용연계형-인턴-최종-전환-후기";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"2024 카카오 채용 연계형 겨울 인턴십 지원 후기.md": {
	id: "2024 카카오 채용 연계형 겨울 인턴십 지원 후기.md";
  slug: "2024-카카오-채용-연계형-겨울-인턴십-지원-후기";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"3. 네트워킹 1.md": {
	id: "3. 네트워킹 1.md";
  slug: "3-네트워킹-1";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"4. 컴퓨팅.md": {
	id: "4. 컴퓨팅.md";
  slug: "4-컴퓨팅";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"5. 스토리지.md": {
	id: "5. 스토리지.md";
  slug: "5-스토리지";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"6. 데이터베이스 서비스.md": {
	id: "6. 데이터베이스 서비스.md";
  slug: "6-데이터베이스-서비스";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"7. 모니터링 및 크기 조정.md": {
	id: "7. 모니터링 및 크기 조정.md";
  slug: "7-모니터링-및-크기-조정";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"8. 자동화.md": {
	id: "8. 자동화.md";
  slug: "8-자동화";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"9. 컨테이너.md": {
	id: "9. 컨테이너.md";
  slug: "9-컨테이너";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Beanstalk 환경변수 추출.md": {
	id: "Beanstalk 환경변수 추출.md";
  slug: "beanstalk-환경변수-추출";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Bulk Insert.md": {
	id: "Bulk Insert.md";
  slug: "bulk-insert";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Intel Korea SW Engineer Intern 지원 후기.md": {
	id: "Intel Korea SW Engineer Intern 지원 후기.md";
  slug: "intel-korea-sw-engineer-intern-지원-후기";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"JOIN.md": {
	id: "JOIN.md";
  slug: "join";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"JPA 연관관계.md": {
	id: "JPA 연관관계.md";
  slug: "jpa-연관관계";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 04 Process.md": {
	id: "OSTEP 04 Process.md";
  slug: "ostep-04-process";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 05 Process API.md": {
	id: "OSTEP 05 Process API.md";
  slug: "ostep-05-process-api";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 06 Direct Execution.md": {
	id: "OSTEP 06 Direct Execution.md";
  slug: "ostep-06-direct-execution";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 07 CPU Scheduling.md": {
	id: "OSTEP 07 CPU Scheduling.md";
  slug: "ostep-07-cpu-scheduling";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 08 Multi-level Feedback Queue, MLFQ.md": {
	id: "OSTEP 08 Multi-level Feedback Queue, MLFQ.md";
  slug: "ostep-08-multi-level-feedback-queue-mlfq";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 09 Lottery Scheduling.md": {
	id: "OSTEP 09 Lottery Scheduling.md";
  slug: "ostep-09-lottery-scheduling";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 10 Multi-CPU Scheduling.md": {
	id: "OSTEP 10 Multi-CPU Scheduling.md";
  slug: "ostep-10-multi-cpu-scheduling";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 13 Address Spaces.md": {
	id: "OSTEP 13 Address Spaces.md";
  slug: "ostep-13-address-spaces";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 14 Memory API.md": {
	id: "OSTEP 14 Memory API.md";
  slug: "ostep-14-memory-api";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 15 Address Translation.md": {
	id: "OSTEP 15 Address Translation.md";
  slug: "ostep-15-address-translation";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 16 Segmentation.md": {
	id: "OSTEP 16 Segmentation.md";
  slug: "ostep-16-segmentation";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 17 Free Space Management.md": {
	id: "OSTEP 17 Free Space Management.md";
  slug: "ostep-17-free-space-management";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 18 Introduction to Paging.md": {
	id: "OSTEP 18 Introduction to Paging.md";
  slug: "ostep-18-introduction-to-paging";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 19 Translation Lookaside Buffer.md": {
	id: "OSTEP 19 Translation Lookaside Buffer.md";
  slug: "ostep-19-translation-lookaside-buffer";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 20 Advanced Page Tables.md": {
	id: "OSTEP 20 Advanced Page Tables.md";
  slug: "ostep-20-advanced-page-tables";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 21 Swapping Mechanisms.md": {
	id: "OSTEP 21 Swapping Mechanisms.md";
  slug: "ostep-21-swapping-mechanisms";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 22 Swapping Policies.md": {
	id: "OSTEP 22 Swapping Policies.md";
  slug: "ostep-22-swapping-policies";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 26 Concurrency and Threads.md": {
	id: "OSTEP 26 Concurrency and Threads.md";
  slug: "ostep-26-concurrency-and-threads";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 27 Thread API.md": {
	id: "OSTEP 27 Thread API.md";
  slug: "ostep-27-thread-api";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 28 Locks.md": {
	id: "OSTEP 28 Locks.md";
  slug: "ostep-28-locks";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 29 Locked Data Structures.md": {
	id: "OSTEP 29 Locked Data Structures.md";
  slug: "ostep-29-locked-data-structures";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 30 Condition Variables.md": {
	id: "OSTEP 30 Condition Variables.md";
  slug: "ostep-30-condition-variables";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 31 Semaphores.md": {
	id: "OSTEP 31 Semaphores.md";
  slug: "ostep-31-semaphores";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 32 Concurrency Bugs.md": {
	id: "OSTEP 32 Concurrency Bugs.md";
  slug: "ostep-32-concurrency-bugs";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 33 Event-based Concurrency.md": {
	id: "OSTEP 33 Event-based Concurrency.md";
  slug: "ostep-33-event-based-concurrency";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 36 IO Devices.md": {
	id: "OSTEP 36 IO Devices.md";
  slug: "ostep-36-io-devices";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 37 Hard Disk Drives.md": {
	id: "OSTEP 37 Hard Disk Drives.md";
  slug: "ostep-37-hard-disk-drives";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 38 Redundant Disk Arrays (RAID).md": {
	id: "OSTEP 38 Redundant Disk Arrays (RAID).md";
  slug: "ostep-38-redundant-disk-arrays-raid";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 40 File System Implementation.md": {
	id: "OSTEP 40 File System Implementation.md";
  slug: "ostep-40-file-system-implementation";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"OSTEP 교재.md": {
	id: "OSTEP 교재.md";
  slug: "ostep-교재";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Real MySQL 8.0 8장 인덱스.md": {
	id: "Real MySQL 8.0 8장 인덱스.md";
  slug: "real-mysql-80-8장-인덱스";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Real MySQL 8.0 9장 옵티마이저와 힌트.md": {
	id: "Real MySQL 8.0 9장 옵티마이저와 힌트.md";
  slug: "real-mysql-80-9장-옵티마이저와-힌트";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"SELECT.md": {
	id: "SELECT.md";
  slug: "select";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"SW 마에스트로 14기 합격 후기.md": {
	id: "SW 마에스트로 14기 합격 후기.md";
  slug: "sw-마에스트로-14기-합격-후기";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"그래프 최단경로 알고리즘 정리.md": {
	id: "그래프 최단경로 알고리즘 정리.md";
  slug: "그래프-최단경로-알고리즘-정리";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"백준  2261번 가장 가까운 두 점.md": {
	id: "백준  2261번 가장 가까운 두 점.md";
  slug: "백준--2261번-가장-가까운-두-점";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"백준 1062번 가르침.md": {
	id: "백준 1062번 가르침.md";
  slug: "백준-1062번-가르침";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"백준 10986번 나머지 합.md": {
	id: "백준 10986번 나머지 합.md";
  slug: "백준-10986번-나머지-합";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"백준 11444번 피보나치 수 6.md": {
	id: "백준 11444번 피보나치 수 6.md";
  slug: "백준-11444번-피보나치-수-6";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"백준 13489번 Vještica.md": {
	id: "백준 13489번 Vještica.md";
  slug: "백준-13489번-vještica";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"백준 13711번 LCS 4.md": {
	id: "백준 13711번 LCS 4.md";
  slug: "백준-13711번-lcs-4";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"백준 1588번 수열.md": {
	id: "백준 1588번 수열.md";
  slug: "백준-1588번-수열";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"백준 17297번 Messi Gimossi.md": {
	id: "백준 17297번 Messi Gimossi.md";
  slug: "백준-17297번-messi-gimossi";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"백준 17835번 면접보는 승범이네.md": {
	id: "백준 17835번 면접보는 승범이네.md";
  slug: "백준-17835번-면접보는-승범이네";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"백준 23741번 야바위 게임.md": {
	id: "백준 23741번 야바위 게임.md";
  slug: "백준-23741번-야바위-게임";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"백준 24229번 모두싸인 출근길.md": {
	id: "백준 24229번 모두싸인 출근길.md";
  slug: "백준-24229번-모두싸인-출근길";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"백준 25949번 Jar Game.md": {
	id: "백준 25949번 Jar Game.md";
  slug: "백준-25949번-jar-game";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"백준 25953번 템포럴 그래프.md": {
	id: "백준 25953번 템포럴 그래프.md";
  slug: "백준-25953번-템포럴-그래프";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"백준 2629번 양팔저울.md": {
	id: "백준 2629번 양팔저울.md";
  slug: "백준-2629번-양팔저울";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"백준 27066번 나무 블럭 게임.md": {
	id: "백준 27066번 나무 블럭 게임.md";
  slug: "백준-27066번-나무-블럭-게임";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"백준 27068번 이미지 보정 작업.md": {
	id: "백준 27068번 이미지 보정 작업.md";
  slug: "백준-27068번-이미지-보정-작업";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"백준 9370번 미확인 도착지.md": {
	id: "백준 9370번 미확인 도착지.md";
  slug: "백준-9370번-미확인-도착지";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"백준 9694번 무엇을 아느냐가 아니라 누구를 아느냐가 문제다.md": {
	id: "백준 9694번 무엇을 아느냐가 아니라 누구를 아느냐가 문제다.md";
  slug: "백준-9694번-무엇을-아느냐가-아니라-누구를-아느냐가-문제다";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"비트마스크.md": {
	id: "비트마스크.md";
  slug: "비트마스크";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"전역 후기.md": {
	id: "전역 후기.md";
  slug: "전역-후기";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
};
"templates": {
"frontmatter.md": {
	id: "frontmatter.md";
  slug: "frontmatter";
  body: string;
  collection: "templates";
  data: any
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = typeof import("../src/content/config.js");
}
