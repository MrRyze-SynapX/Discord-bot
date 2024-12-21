// Import Discord.js und dotenv
const { Client, Intents, MessageEmbed } = require("discord.js");
require("dotenv").config();

// Bot-Client initialisieren
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Datenbanken simulieren (ersetze durch echte Datenbank wie MongoDB/SQLite)
let ticketChannels = {};
let giveaways = [];
let products = [
  { id: 1, name: "VIP Rank", price: 10 },
  { id: 2, name: "Special Role", price: 5 },
];

// Event: Bot bereit
client.once("ready", () => {
  console.log(`${client.user.tag} ist online!`);
});

// Slash Commands registrieren
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  // 1. Ticket-System-Setup
  if (commandName === "ticketsystemsetup") {
    const categoryName = options.getString("category");
    const embed = new MessageEmbed()
      .setTitle("Ticket-System eingerichtet!")
      .setDescription(
        `Das Ticket-System wurde unter der Kategorie **${categoryName}** eingerichtet.`
      )
      .setColor("BLUE");
    ticketChannels[interaction.guild.id] = categoryName; // Speichert die Kategorie
    await interaction.reply({ embeds: [embed] });
  }

  // 2. Giveaway starten
  else if (commandName === "giveaway") {
    const prize = options.getString("prize");
    const duration = options.getInteger("duration");
    const embed = new MessageEmbed()
      .setTitle("🎉 Giveaway gestartet!")
      .setDescription(`Gewinn: **${prize}**\nDauer: **${duration} Minuten**`)
      .setColor("GREEN");
    giveaways.push({ prize, duration, createdAt: Date.now() });
    await interaction.reply({ embeds: [embed] });

    setTimeout(() => {
      const winner = interaction.guild.members.cache.random();
      interaction.followUp(
        `🎉 Das Giveaway für **${prize}** ist beendet! Gewinner: ${winner}`
      );
    }, duration * 60 * 1000);
  }

  // 3. Kaufen
  else if (commandName === "buy") {
    const productId = options.getInteger("product_id");
    const product = products.find((p) => p.id === productId);

    if (!product) {
      return interaction.reply("❌ Produkt nicht gefunden!");
    }

    const embed = new MessageEmbed()
      .setTitle("🛒 Produkt gekauft!")
      .setDescription(
        `Du hast das Produkt **${product.name}** für **${product.price}€** gekauft!`
      )
      .setColor("GOLD");
    await interaction.reply({ embeds: [embed] });
  }
});

// Slash Commands initialisieren
client.on("ready", async () => {
  const guild = client.guilds.cache.first();

  await guild.commands.create({
    name: "ticketsystemsetup",
    description: "Richte das Ticket-System ein",
    options: [
      {
        name: "category",
        description: "Name der Kategorie für Tickets",
        type: "STRING",
        required: true,
      },
    ],
  });

  await guild.commands.create({
    name: "giveaway",
    description: "Starte ein Giveaway",
    options: [
      {
        name: "prize",
        description: "Der Gewinn des Giveaways",
        type: "STRING",
        required: true,
      },
      {
        name: "duration",
        description: "Dauer des Giveaways in Minuten",
        type: "INTEGER",
        required: true,
      },
    ],
  });

  await guild.commands.create({
    name: "buy",
    description: "Kaufe ein Produkt",
    options: [
      {
        name: "product_id",
        description: "Die ID des Produkts",
        type: "INTEGER",
        required: true,
      },
    ],
  });

  console.log("Slash Commands registriert!");
});

// Bot starten
client.login(process.env.TOKEN);
