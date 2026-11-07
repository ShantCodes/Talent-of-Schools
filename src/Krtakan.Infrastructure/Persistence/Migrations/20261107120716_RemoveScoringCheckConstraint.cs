using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Krtakan.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveScoringCheckConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Scorings",
                table: "Scorings");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Scorings_Score",
                table: "Scorings");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "Scorings",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .OldAnnotation("Sqlite:Autoincrement", true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Scorings",
                table: "Scorings",
                columns: new[] { "EventParticipantId", "JurorId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Scorings",
                table: "Scorings");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "Scorings",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .Annotation("Sqlite:Autoincrement", true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Scorings",
                table: "Scorings",
                column: "Id");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Scorings_Score",
                table: "Scorings",
                sql: "Score >= 0 AND Score <= 100");
        }
    }
}
