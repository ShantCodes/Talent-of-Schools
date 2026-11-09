using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Krtakan.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddEventIdToScoring : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EventId",
                table: "Scorings",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Scorings_EventId",
                table: "Scorings",
                column: "EventId");

            migrationBuilder.AddForeignKey(
                name: "FK_Scorings_Events_EventId",
                table: "Scorings",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Scorings_Events_EventId",
                table: "Scorings");

            migrationBuilder.DropIndex(
                name: "IX_Scorings_EventId",
                table: "Scorings");

            migrationBuilder.DropColumn(
                name: "EventId",
                table: "Scorings");
        }
    }
}
