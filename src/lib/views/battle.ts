import type { CombatState as ProtoCombatState, Monster } from '../../gen/v1/domain_pb';
import { protoToMilliseconds } from '$lib/utils/prototime';

export type BattleMonsterView = {
	monster: Monster;
	attackCooldownMs: number;
	nextAttackAtMs: number | null;
	attackElapsedMs: number;
	lastAttackedAtMs: number | null;
};

export const toBattleMonsterView = (monster: Monster, nowMs: number): BattleMonsterView => {
	const combatState = monster.combatState as ProtoCombatState | undefined;
	if (!combatState) {
		return {
			monster,
			attackCooldownMs: 0,
			nextAttackAtMs: null,
			attackElapsedMs: 0,
			lastAttackedAtMs: null,
		};
	}

	const nextAttackAtMs = combatState.nextAttackAt ? protoToMilliseconds(combatState.nextAttackAt) : null;
	const cooldown = combatState.attackCooldownMs ?? 0;
	const elapsed =
		nextAttackAtMs == null || cooldown <= 0
			? 0
			: Math.max(0, Math.min(cooldown, cooldown-(nextAttackAtMs - nowMs)));

	return {
		monster,
		attackCooldownMs: cooldown,
		nextAttackAtMs,
		attackElapsedMs: elapsed,
		lastAttackedAtMs: nextAttackAtMs != null ? nextAttackAtMs - cooldown : null,
	};
};
