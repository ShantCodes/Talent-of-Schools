using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Krtakan.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddOptionalPerformanceToScoring : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Scorings_Performances_PerformanceId",
                table: "Scorings");

            migrationBuilder.DropIndex(
                name: "IX_Scorings_PerformanceId_JurorId",
                table: "Scorings");

            migrationBuilder.AlterColumn<int>(
                name: "PerformanceId",
                table: "Scorings",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AddColumn<int>(
                name: "EventParticipantId",
                table: "Scorings",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Scorings_EventParticipantId_JurorId",
                table: "Scorings",
                columns: new[] { "EventParticipantId", "JurorId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Scorings_PerformanceId",
                table: "Scorings",
                column: "PerformanceId");

            migrationBuilder.AddForeignKey(
                name: "FK_Scorings_EventParticipants_EventParticipantId",
                table: "Scorings",
                column: "EventParticipantId",
                principalTable: "EventParticipants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Scorings_Performances_PerformanceId",
                table: "Scorings",
                column: "PerformanceId",
                principalTable: "Performances",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Scorings_EventParticipants_EventParticipantId",
                table: "Scorings");

            migrationBuilder.DropForeignKey(
                name: "FK_Scorings_Performances_PerformanceId",
                table: "Scorings");

            migrationBuilder.DropIndex(
                name: "IX_Scorings_EventParticipantId_JurorId",
                table: "Scorings");

            migrationBuilder.DropIndex(
                name: "IX_Scorings_PerformanceId",
                table: "Scorings");

            migrationBuilder.DropColumn(
                name: "EventParticipantId",
                table: "Scorings");

            migrationBuilder.AlterColumn<int>(
                name: "PerformanceId",
                table: "Scorings",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Scorings_PerformanceId_JurorId",
                table: "Scorings",
                columns: new[] { "PerformanceId", "JurorId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Scorings_Performances_PerformanceId",
                table: "Scorings",
                column: "PerformanceId",
                principalTable: "Performances",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
