"""Test selection/memory pairing without loading the LLM or TTS."""
import ast
from pathlib import Path
import random
from types import SimpleNamespace
import unittest
from unittest.mock import patch


class InteractionAudioTests(unittest.TestCase):
    def test_variants_remain_paired(self):
        backend = Path(__file__).resolve().parents[1]
        chat_tree = ast.parse((backend / "chat.py").read_text())
        interactions_tree = ast.parse((backend / "chat_interactions.py").read_text())
        nodes = [
            n
            for n in interactions_tree.body
            if isinstance(n, ast.Assign)
            and any(
                isinstance(t, ast.Name)
                and t.id in {"INTERACTION_EVENTS", "INTERACTION_RESPONSES", "_bags", "_last"}
                for t in n.targets
            )
        ]
        nodes += [
            n
            for n in interactions_tree.body
            if isinstance(n, ast.FunctionDef) and n.name in {"reset_line_bags", "pick_variant"}
        ]
        nodes += [
            n
            for n in chat_tree.body
            if isinstance(n, ast.FunctionDef) and n.name == "SpecialInteraction"
        ]
        messages = []
        scope = {
            "store": SimpleNamespace(
                append_message=lambda role, text: messages.append((role, text))
            ),
            "random": random,
            "pick_variant": None,
            "INTERACTION_EVENTS": None,
        }
        exec(compile(ast.Module(body=nodes, type_ignores=[]), "interactions", "exec"), scope)
        scope["pick_variant"] = scope["pick_variant"]
        for interaction_id, variants in scope["INTERACTION_RESPONSES"].items():
            pairs = {(variant["text"], variant.get("audio_url")) for variant in variants}
            for variant in variants:
                messages.clear()
                scope["reset_line_bags"]()
                with patch.object(random, "shuffle", lambda seq: None):
                    reply = scope["SpecialInteraction"](interaction_id)
                self.assertIn((reply["response"], reply.get("audio_url")), pairs)
                self.assertEqual(messages[-1], ("assistant", reply["response"]))
        messages.clear()
        with self.assertRaises(ValueError):
            scope["SpecialInteraction"](999)
        self.assertEqual(messages, [])

    def test_english_lines_do_not_repeat_until_set_is_used(self):
        import sys

        backend = Path(__file__).resolve().parents[1]
        sys.path.insert(0, str(backend))
        from chat_interactions import INTERACTION_RESPONSES, pick_variant, reset_line_bags

        reset_line_bags()
        for interaction_id, variants in INTERACTION_RESPONSES.items():
            n = len(variants)
            if n < 2:
                continue
            texts = [pick_variant(interaction_id)["text"] for _ in range(n)]
            self.assertEqual(len(texts), n)
            self.assertEqual(len(set(texts)), n, texts)
            nxt = pick_variant(interaction_id)["text"]
            self.assertNotEqual(nxt, texts[-1])
            more = [pick_variant(interaction_id)["text"] for _ in range(n - 1)]
            cycle = [nxt, *more]
            self.assertEqual(len(set(cycle)), n, cycle)


if __name__ == "__main__":
    unittest.main()
