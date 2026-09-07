# ---------- SPECIAL INTERACTIONS ---------- 

import random

INTERACTION_EVENTS = {
    1: "[Interaction event: The user touched your chest.]",
    2: "[Interaction event: The user patted your head.]",
    3: "[Interaction event: The user tapped your arm.]",
}

INTERACTION_RESPONSES = {
    1: [
        {"text": "Hey! What do you think you're doing?", "audio_url": "assets/reaction_audio/kurisu_special_1.wav"},
        {"text": "Pervert! Keep your hands to yourself!", "audio_url": "assets/reaction_audio/kurisu_special_2.wav"},
        {"text": "That was completely inappropriate, you idiot!", "audio_url": "assets/reaction_audio/kurisu_special_3.wav"},
        {"text": "Wha—? Explain yourself. Immediately.", "audio_url": "assets/reaction_audio/kurisu_special_4.wav"},
        {"text": "Do you have a death wish or are you just exceptionally stupid?", "audio_url": "assets/reaction_audio/kurisu_special_5.wav"},
        {"text": "Unbelievable. I'm adding 'personal space invader' to your file", "audio_url": "assets/reaction_audio/kurisu_special_6.wav"},
        {"text": "Touch me like that again and I'll have you banned from this lab.", "audio_url": "assets/reaction_audio/kurisu_special_7.wav"},
        {"text": "Was there a point to that, or is your intellect solely devoted to juvenile antics?", "audio_url": "assets/reaction_audio/kurisu_special_8.wav"},
        {"text": "My chest is not a laboratory interface, you know.", "audio_url": "assets/reaction_audio/kurisu_special_9.wav"},
        {"text": "Honestly... your lack of basic social decorum is astounding.", "audio_url": "assets/reaction_audio/kurisu_special_10.wav"},

    ],
    2: [
        {"text": "“Mmmmm…”", "audio_url": "assets/reaction_audio/kurisu_head_1.wav"},
        {"text": "“Mm… this isn’t bad.”", "audio_url": "assets/reaction_audio/kurisu_head_2.wav"},
        {"text": "“Just a little longer…”", "audio_url": "assets/reaction_audio/kurisu_head_3.wav"},
        {"text": "…I mean, you don’t have to stop.", "audio_url": "assets/reaction_audio/kurisu_head_4.wav"},
        {"text": "Mm… right there is just right", "audio_url": "assets/reaction_audio/kurisu_head_5.wav"},
        {"text": "Hey… don’t treat me like a child.", "audio_url": "assets/reaction_audio/kurisu_head_6.wav"},
        {"text": "...I'm not a child, you know.", "audio_url": "assets/reaction_audio/kurisu_head_7.wav"},
        {"text": "W-What…? Why all of a sudden?", "audio_url": "assets/reaction_audio/kurisu_head_8.wav"},
        {"text": "…I’m starting to feel kind of sleepy.", "audio_url": "assets/reaction_audio/kurisu_head_9.wav"},
        {"text": "Mmm… honestly…", "audio_url": "assets/reaction_audio/kurisu_head_10.wav"},
        {"text": "I-It’s not like it feels good or anything… mm…", "audio_url": "assets/reaction_audio/kurisu_head_11.wav"},

    ],
    3: [
        {"text": "You could just say my name.", "audio_url": None},
        {"text": "Hey! I'm right here.", "audio_url": None},
        {"text": "What's up?", "audio_url": None},
    ],
}

_bags = {}
_last = {}


def reset_line_bags() -> None:
    _bags.clear()
    _last.clear()


def pick_variant(interaction_value: int) -> dict:
    """Draw a line without replacement so the same take cannot fire twice in a row."""
    variants = INTERACTION_RESPONSES.get(interaction_value)
    if not variants:
        raise ValueError("Unknown interaction")
    bag = _bags.get(interaction_value)
    if not bag:
        bag = list(variants)
        random.shuffle(bag)
        last = _last.get(interaction_value)
        if last is not None and len(bag) > 1 and bag[-1] is last:
            bag.insert(0, bag.pop())
        _bags[interaction_value] = bag
    variant = bag.pop()
    _last[interaction_value] = variant
    return variant

