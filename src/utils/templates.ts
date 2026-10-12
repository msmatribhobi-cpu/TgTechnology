import { PluginTemplate } from '../types';

export const PLUGIN_TEMPLATES: PluginTemplate[] = [
  {
    id: 'op-sword',
    name: 'OpSword (Custom Weapon & Effects)',
    tagline: 'Gives players an Overpowered Diamond Sword with custom lore, particles, and hit knockback.',
    pluginName: 'OpSword',
    apiVersion: '4.0.0',
    pluginVersion: '1.6.0',
    author: 'TgTechnoLogy',
    description: 'Overpowered God Sword plugin with special ability events and /opsword command.',
    files: [
      {
        path: 'plugin.yml',
        content: `name: OpSword
version: 1.6.0
api: 4.0.0
main: OpSword\\Main
author: TgTechnoLogy
description: "Overpowered God Sword with custom enchantments, particles, and /opsword command."

commands:
  opsword:
    description: "Get the Legendary OP Sword"
    usage: "/opsword [player]"
    permission: opsword.command.give
    aliases: [godsword, opsw]

permissions:
  opsword.command.give:
    description: "Allows player to receive or give the OP Sword"
    default: op
`,
      },
      {
        path: 'src/OpSword/Main.php',
        content: `<?php

declare(strict_types=1);

namespace OpSword;

use pocketmine\\plugin\\PluginBase;
use pocketmine\\event\\Listener;
use pocketmine\\command\\Command;
use pocketmine\\command\\CommandSender;
use pocketmine\\player\\Player;
use pocketmine\\item\\VanillaItems;
use pocketmine\\item\\enchantment\\EnchantmentInstance;
use pocketmine\\item\\enchantment\\VanillaEnchantments;
use pocketmine\\event\\entity\\EntityDamageByEntityEvent;
use pocketmine\\world\\particle\\FlameParticle;
use pocketmine\\world\\particle\\HugeExplodeParticle;
use pocketmine\\utils\\TextFormat;

class Main extends PluginBase implements Listener {

    protected function onEnable(): void {
        $this->getServer()->getPluginManager()->registerEvents($this, $this);
        $this->getLogger()->info(TextFormat::GREEN . "OpSword v" . $this->getDescription()->getVersion() . " by TgTechnoLogy enabled!");
    }

    public function onCommand(CommandSender $sender, Command $command, string $label, array $args): bool {
        if ($command->getName() === "opsword") {
            if (!$sender instanceof Player) {
                $sender->sendMessage(TextFormat::RED . "Please run this command in-game!");
                return true;
            }

            if (!$sender->hasPermission("opsword.command.give")) {
                $sender->sendMessage(TextFormat::RED . "You do not have permission to use this sword!");
                return true;
            }

            $target = $sender;
            if (isset($args[0])) {
                $found = $this->getServer()->getPlayerByPrefix($args[0]);
                if ($found !== null) {
                    $target = $found;
                }
            }

            $sword = VanillaItems::DIAMOND_SWORD();
            $sword->setCustomName(TextFormat::GOLD . TextFormat::BOLD . "★ OP GOD SWORD ★");
            $sword->setLore([
                TextFormat::GRAY . "Forged by TgTechnoLogy",
                TextFormat::RED . "Damage: +9999",
                TextFormat::LIGHT_PURPLE . "Special: Explosive Knockback"
            ]);

            // Add high enchants
            $sharpness = new EnchantmentInstance(VanillaEnchantments::SHARPNESS(), 10);
            $unbreaking = new EnchantmentInstance(VanillaEnchantments::UNBREAKING(), 10);
            $fireAspect = new EnchantmentInstance(VanillaEnchantments::FIRE_ASPECT(), 5);
            
            $sword->addEnchantment($sharpness);
            $sword->addEnchantment($unbreaking);
            $sword->addEnchantment($fireAspect);

            $target->getInventory()->addItem($sword);
            $target->sendMessage(TextFormat::GREEN . "You received the " . TextFormat::GOLD . "★ OP GOD SWORD ★" . TextFormat::GREEN . "!");
            return true;
        }
        return false;
    }

    public function onHit(EntityDamageByEntityEvent $event): void {
        $damager = $event->getDamager();
        if ($damager instanceof Player) {
            $item = $damager->getInventory()->getItemInHand();
            if ($item->getCustomName() === TextFormat::GOLD . TextFormat::BOLD . "★ OP GOD SWORD ★") {
                $victim = $event->getEntity();
                $pos = $victim->getPosition();
                $world = $pos->getWorld();

                // Spawn cool particles on hit
                $world->addParticle($pos, new FlameParticle());
                $world->addParticle($pos, new HugeExplodeParticle());
                
                $damager->sendPopup(TextFormat::RED . "CRITICAL OP HIT! ⚡");
            }
        }
    }

    protected function onDisable(): void {
        $this->getLogger()->info(TextFormat::RED . "OpSword disabled!");
    }
}
`,
      },
      {
        path: 'resources/config.yml',
        content: `# OpSword Configuration by TgTechnoLogy
# Custom settings for OP weapon stats
sword-name: "§6§l★ OP GOD SWORD ★"
enable-particles: true
enable-sound: true
damage-multiplier: 5.0
`,
      }
    ]
  },
  {
    id: 'commands-pack',
    name: 'Essential Server Commands (/heal, /feed, /fly)',
    tagline: 'Standard server administration commands with permission checks and message formatting.',
    pluginName: 'TgEssentials',
    apiVersion: '4.0.0',
    pluginVersion: '1.0.0',
    author: 'TgTechnoLogy',
    description: 'Essential utility commands for PocketMine-MP server players.',
    files: [
      {
        path: 'plugin.yml',
        content: `name: TgEssentials
version: 1.0.0
api: 4.0.0
main: TgEssentials\\Main
author: TgTechnoLogy
description: "Essential player management commands: /heal, /feed, /fly"

commands:
  heal:
    description: "Restore player health"
    usage: "/heal [player]"
    permission: tgessentials.heal
  feed:
    description: "Restore player hunger bar"
    usage: "/feed [player]"
    permission: tgessentials.feed
  fly:
    description: "Toggle creative flight mode"
    usage: "/fly [player]"
    permission: tgessentials.fly

permissions:
  tgessentials.heal:
    description: "Allows using /heal"
    default: op
  tgessentials.feed:
    description: "Allows using /feed"
    default: op
  tgessentials.fly:
    description: "Allows using /fly"
    default: op
`,
      },
      {
        path: 'src/TgEssentials/Main.php',
        content: `<?php

declare(strict_types=1);

namespace TgEssentials;

use pocketmine\\plugin\\PluginBase;
use pocketmine\\command\\Command;
use pocketmine\\command\\CommandSender;
use pocketmine\\player\\Player;
use pocketmine\\utils\\TextFormat;

class Main extends PluginBase {

    protected function onEnable(): void {
        $this->getLogger()->info(TextFormat::AQUA . "TgEssentials enabled successfully!");
    }

    public function onCommand(CommandSender $sender, Command $command, string $label, array $args): bool {
        if (!$sender instanceof Player) {
            $sender->sendMessage(TextFormat::RED . "This command can only be used in-game.");
            return true;
        }

        switch ($command->getName()) {
            case "heal":
                $sender->setHealth($sender->getMaxHealth());
                $sender->sendMessage(TextFormat::GREEN . "Your health has been restored!");
                return true;

            case "feed":
                $sender->getHungerManager()->setFood(20);
                $sender->sendMessage(TextFormat::GREEN . "Your hunger has been satiated!");
                return true;

            case "fly":
                $isFlying = $sender->getAllowFlight();
                $sender->setAllowFlight(!$isFlying);
                $sender->setFlying(!$isFlying);
                $status = !$isFlying ? TextFormat::GREEN . "ENABLED" : TextFormat::RED . "DISABLED";
                $sender->sendMessage(TextFormat::YELLOW . "Flight mode has been " . $status . "!");
                return true;
        }

        return false;
    }
}
`,
      }
    ]
  },
  {
    id: 'welcome-events',
    name: 'Player Join/Quit & Welcome Broadcaster',
    tagline: 'Custom MOTD, colorful join/leave messages, and title popup greeting on connect.',
    pluginName: 'WelcomeAnnouncer',
    apiVersion: '4.0.0',
    pluginVersion: '1.2.0',
    author: 'TgTechnoLogy',
    description: 'Custom player greeting and join title notifications.',
    files: [
      {
        path: 'plugin.yml',
        content: `name: WelcomeAnnouncer
version: 1.2.0
api: 4.0.0
main: WelcomeAnnouncer\\Main
author: TgTechnoLogy
description: "Welcomes players with title popups and sounds upon joining."
`,
      },
      {
        path: 'src/WelcomeAnnouncer/Main.php',
        content: `<?php

declare(strict_types=1);

namespace WelcomeAnnouncer;

use pocketmine\\plugin\\PluginBase;
use pocketmine\\event\\Listener;
use pocketmine\\event\\player\\PlayerJoinEvent;
use pocketmine\\event\\player\\PlayerQuitEvent;
use pocketmine\\utils\\TextFormat;

class Main extends PluginBase implements Listener {

    protected function onEnable(): void {
        $this->getServer()->getPluginManager()->registerEvents($this, $this);
        $this->getLogger()->info(TextFormat::LIGHT_PURPLE . "WelcomeAnnouncer is active!");
    }

    public function onJoin(PlayerJoinEvent $event): void {
        $player = $event->getPlayer();
        $name = $player->getName();

        $event->setJoinMessage(TextFormat::GREEN . "[+] " . TextFormat::WHITE . $name . TextFormat::GRAY . " joined the server!");
        
        $player->sendTitle(
            TextFormat::GOLD . TextFormat::BOLD . "WELCOME",
            TextFormat::AQUA . "Enjoy your stay on the server!",
            20, 60, 20
        );
    }

    public function onQuit(PlayerQuitEvent $event): void {
        $player = $event->getPlayer();
        $event->setQuitMessage(TextFormat::RED . "[-] " . TextFormat::WHITE . $player->getName() . TextFormat::GRAY . " left the game.");
    }
}
`,
      }
    ]
  },
  {
    id: 'blank-starter',
    name: 'Blank Clean PocketMine Starter',
    tagline: 'Minimal boilerplate with strict types and clean lifecycle hooks for starting from scratch.',
    pluginName: 'MyNewPlugin',
    apiVersion: '4.0.0',
    pluginVersion: '1.0.0',
    author: 'TgTechnoLogy',
    description: 'Clean starter plugin for PocketMine-MP.',
    files: [
      {
        path: 'plugin.yml',
        content: `name: MyNewPlugin
version: 1.0.0
api: 4.0.0
main: MyNewPlugin\\Main
author: TgTechnoLogy
description: "A fresh PocketMine-MP plugin created with TgTechnoLogy"
`,
      },
      {
        path: 'src/MyNewPlugin/Main.php',
        content: `<?php

declare(strict_types=1);

namespace MyNewPlugin;

use pocketmine\\plugin\\PluginBase;
use pocketmine\\event\\Listener;
use pocketmine\\utils\\TextFormat;

class Main extends PluginBase implements Listener {

    protected function onEnable(): void {
        $this->getServer()->getPluginManager()->registerEvents($this, $this);
        $this->getLogger()->info(TextFormat::GREEN . "MyNewPlugin enabled successfully!");
    }

    protected function onDisable(): void {
        $this->getLogger()->info(TextFormat::RED . "MyNewPlugin disabled!");
    }
}
`,
      }
    ]
  }
];
